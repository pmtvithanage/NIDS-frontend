/**
 * Dummy alerts resource: seeded generation plus list/detail/mutation helpers.
 * No React imports. All state lives in the shared store.
 * @module dummy/alerts.dummy
 */

import { ALERT_EXPORT_COLUMNS } from '../constants/alerts.js'
import { ASSIGNEES } from '../constants/assignees.js'
import { LABEL } from '../constants/labels.js'
import { SURICATA_SIGNATURES } from '../constants/signatures.js'
import { SEVERITY, SEVERITY_ORDER } from '../constants/severity.js'
import { toCsv } from '../utils/csv.js'
import {
  evidenceQuality,
  evidenceScore,
  isLikelyNoise,
} from '../utils/evidence.js'
import { matchesIpQuery } from '../utils/ip.js'
import { delay, paginate, rngFloat, rngInt, seededRandom } from './helpers.js'
import { matchesAlert } from './suppressionMatch.js'
import { findAlert, getAlerts, getState, patchAlert, patchAlerts } from './store.js'

export const SENSOR_ID = 'charitha'
export const AE_THRESHOLD = 0.105
export const ALERT_COUNT = 300
export const DEFAULT_LIMIT = 25
const SEED = 20260415
const SEVEN_DAYS_MIN = 7 * 24 * 60

const INTERNAL_PREFIXES = ['192.168.8', '192.168.1', '10.0.0', '10.10.2', '172.16.4']
const EXTERNAL_PREFIXES = ['20.205.243', '185.199.108', '104.18.32', '45.33.32', '95.216.10', '203.0.113', '198.51.100']
const PORTS = [443, 80, 22, 53, 3306, 3389, 8080, 445, 25, 123, 1900, 161, 1433, 5900, 4444]
const PROTOCOLS = ['TCP', 'TCP', 'TCP', 'UDP', 'UDP', 'ICMP']
const NOTES = [
  'Raised by correlation rule.',
  'Reviewing related flows.',
  'Confirmed after manual triage.',
  'Escalated to IR.',
]
const STATUS_WEIGHTS = [
  ['new', 0.34],
  ['triaging', 0.2],
  ['confirmed', 0.14],
  ['false_positive', 0.14],
  ['resolved', 0.18],
]
const CATEGORY_LABEL = {
  scan: LABEL.PORT_SCAN,
  dos: LABEL.DOS,
  ddos: LABEL.DDOS,
  'trojan-activity': LABEL.BOT,
  malware: LABEL.BOT,
  'web-application-attack': LABEL.WEB_ATTACK,
  'brute-force': LABEL.BRUTE_FORCE,
  'attempted-recon': LABEL.PORT_SCAN,
  'attempted-admin': LABEL.BRUTE_FORCE,
}

const SIG_SELECTION = SURICATA_SIGNATURES.map((sig) => ({ sig, w: 0.05 + (1 - sig.weight) }))
const SIG_TOTAL = SIG_SELECTION.reduce((sum, entry) => sum + entry.w, 0)

let liveSeq = ALERT_COUNT

function rngPick(rng, list) {
  return list[rngInt(rng, 0, list.length - 1)]
}
function rngChance(rng, p) {
  return rng() < p
}
function alertId(n) {
  return `ALT-${String(n).padStart(6, '0')}`
}
function maxTier(a, b) {
  return SEVERITY_ORDER.indexOf(a) >= SEVERITY_ORDER.indexOf(b) ? a : b
}

function pickSignature(rng) {
  let r = rng() * SIG_TOTAL
  for (const entry of SIG_SELECTION) {
    r -= entry.w
    if (r <= 0) return entry.sig
  }
  return SURICATA_SIGNATURES[SURICATA_SIGNATURES.length - 1]
}

function pickLabel(rng, sig) {
  const base = CATEGORY_LABEL[sig.category] ?? LABEL.BENIGN
  if (base === LABEL.BENIGN) return LABEL.BENIGN
  return sig.weight < 0.3 && rngChance(rng, 0.6) ? LABEL.BENIGN : base
}

function mlpConfidenceFor(rng, sig, label) {
  if (label === LABEL.BENIGN) return rngFloat(rng, 0.35, 0.72)
  if (sig.weight >= 0.6) return rngFloat(rng, 0.78, 0.99)
  if (sig.weight >= 0.4) return rngFloat(rng, 0.6, 0.92)
  return rngFloat(rng, 0.42, 0.7)
}

function aeErrorFor(rng, sig, label) {
  const strong = sig.weight >= 0.55 || (label !== LABEL.BENIGN && sig.weight >= 0.4)
  return strong ? rngFloat(rng, 0.12, 90, 3) : rngFloat(rng, 0.02, 0.9, 3)
}

function severityFor(sig, mlpConfidence, aeRatio) {
  let tier =
    sig.severity === 1 ? SEVERITY.HIGH : sig.severity === 2 ? SEVERITY.MEDIUM : SEVERITY.LOW
  if (aeRatio >= 500) tier = SEVERITY.CRITICAL
  else if (aeRatio >= 100) tier = maxTier(tier, SEVERITY.HIGH)
  if (mlpConfidence >= 0.9 && sig.weight >= 0.5) tier = maxTier(tier, SEVERITY.HIGH)
  if (mlpConfidence >= 0.97 && sig.weight >= 0.7) tier = SEVERITY.CRITICAL
  return tier
}

function pickStatus(rng) {
  const r = rng()
  let acc = 0
  for (const [status, weight] of STATUS_WEIGHTS) {
    acc += weight
    if (r <= acc) return status
  }
  return 'new'
}

function buildTuple(rng) {
  const internal = () => `${rngPick(rng, INTERNAL_PREFIXES)}.${rngInt(rng, 2, 254)}`
  const external = () => `${rngPick(rng, EXTERNAL_PREFIXES)}.${rngInt(rng, 2, 254)}`
  const direction = rngPick(rng, ['inbound', 'outbound', 'internal'])
  let srcIp
  let dstIp
  if (direction === 'inbound') {
    srcIp = external()
    dstIp = internal()
  } else if (direction === 'outbound') {
    srcIp = internal()
    dstIp = external()
  } else {
    srcIp = internal()
    dstIp = internal()
  }
  const dstPort = rngPick(rng, PORTS)
  return {
    flow_key: `${srcIp}-${dstIp}-${dstPort}`,
    src_ip: srcIp,
    dst_ip: dstIp,
    dst_port: dstPort,
    protocol: rngPick(rng, PROTOCOLS),
    direction,
  }
}

function finalize(partial, weight) {
  const reasons = [`suricata:${partial.suricata.signature}`]
  reasons.push(`mlp:${partial.mlp_label}(${partial.mlp_confidence})`)
  if (partial.ae_ratio >= 1) reasons.push(`ae:${partial.ae_ratio}x_threshold`)

  const score = evidenceScore({
    suricataWeight: weight,
    mlpConfidence: partial.mlp_confidence,
    aeRatio: partial.ae_ratio,
  })
  return {
    ...partial,
    reasons,
    evidence_score: score,
    evidence_quality: evidenceQuality(score),
    likely_benign: isLikelyNoise({ suricataWeight: weight, mlpConfidence: partial.mlp_confidence }),
    updated_at: partial.ts,
  }
}

function buildAlert(rng, { index, orphan, now }) {
  const sig = pickSignature(rng)
  const label = pickLabel(rng, sig)
  const mlpConfidence = mlpConfidenceFor(rng, sig, label)
  const aeError = aeErrorFor(rng, sig, label)
  const aeRatio = Math.round((aeError / AE_THRESHOLD) * 100) / 100
  const severity = severityFor(sig, mlpConfidence, aeRatio)
  const tuple = orphan
    ? { flow_key: null, src_ip: null, dst_ip: null, dst_port: null, protocol: 'IPv6', direction: 'internal' }
    : buildTuple(rng)

  return finalize(
    {
      id: alertId(index + 1),
      ...tuple,
      ts: new Date(now - rngInt(rng, 5, SEVEN_DAYS_MIN) * 60_000).toISOString(),
      severity_tier: severity,
      mlp_label: label,
      mlp_confidence: mlpConfidence,
      ae_error: aeError,
      ae_threshold: AE_THRESHOLD,
      ae_ratio: aeRatio,
      suricata: {
        signature: sig.signature,
        signature_id: sig.signature_id,
        category: sig.category,
        severity: sig.severity,
      },
      sensor: SENSOR_ID,
      incident_id: null,
      status: pickStatus(rng),
      assignee: rngChance(rng, 0.45) ? null : rngPick(rng, ASSIGNEES),
      notes: rngChance(rng, 0.7) ? '' : rngPick(rng, NOTES),
    },
    sig.weight,
  )
}

function sampleAlert() {
  const now = Date.now()
  return finalize(
    {
      id: alertId(1),
      flow_key: '192.168.8.100-20.205.243.168-443',
      src_ip: '192.168.8.100',
      dst_ip: '20.205.243.168',
      dst_port: 443,
      protocol: 'TCP',
      direction: 'outbound',
      ts: new Date(now - 2 * 60_000).toISOString(),
      severity_tier: SEVERITY.CRITICAL,
      mlp_label: LABEL.DDOS,
      mlp_confidence: 0.5886,
      ae_error: 78.22,
      ae_threshold: AE_THRESHOLD,
      ae_ratio: 744.86,
      suricata: {
        signature: 'SURICATA IPv4 invalid checksum',
        signature_id: 2200073,
        category: 'checksum',
        severity: 3,
      },
      sensor: SENSOR_ID,
      incident_id: 'INC-2026-0001',
      status: 'new',
      assignee: null,
      notes: '',
    },
    0.12,
  )
}

/**
 * Build the seeded alert set (~300 alerts over the last 7 days).
 * The first alert is the canonical real sample.
 * @returns {object[]} Alerts sorted by timestamp descending.
 */
export function generateAlerts() {
  const rng = seededRandom(SEED)
  const now = Date.now()
  const alerts = [sampleAlert()]
  const incidentBySrc = new Map()
  let incidentSeq = 1

  for (let i = 1; i < ALERT_COUNT; i += 1) {
    const orphan = i % 37 === 0
    const alert = buildAlert(rng, { index: i, orphan, now })
    const needsIncident =
      alert.severity_tier === SEVERITY.HIGH || alert.severity_tier === SEVERITY.CRITICAL
    if (needsIncident) {
      const key = alert.src_ip || alert.flow_key || alert.id
      if (!incidentBySrc.has(key)) {
        incidentBySrc.set(key, `INC-2026-${String(incidentSeq).padStart(4, '0')}`)
        incidentSeq += 1
      }
      alert.incident_id = incidentBySrc.get(key)
    }
    alerts.push(alert)
  }

  alerts.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  return alerts
}

/**
 * Create a single live alert (used by the event stream).
 * @returns {object} A new alert object.
 */
export function createLiveAlert() {
  liveSeq += 1
  return buildAlert(Math.random, { index: liveSeq - 1, orphan: Math.random() < 0.05, now: Date.now() })
}

function toArray(value) {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value : String(value).split(',').map((v) => v.trim())
}

function cloneAlert(alert) {
  return alert ? structuredClone(alert) : alert
}

function enabledSuppressions() {
  return getState().suppressions.filter((rule) => rule.enabled !== false)
}

function isSuppressed(alert, rules) {
  return rules.some((rule) => matchesAlert(alert, rule))
}

function matchesEngine(alert, engine) {
  const prefix = `${engine}:`
  return Array.isArray(alert.reasons) && alert.reasons.some((reason) => reason.startsWith(prefix))
}

function matchesSignature(alert, signature) {
  if (signature == null || signature === '') return true
  if (/^\d+$/.test(String(signature))) {
    return alert.suricata.signature_id === Number(signature)
  }
  return String(alert.suricata.signature).toLowerCase().includes(String(signature).toLowerCase())
}

function applyFilters(items, params, rules) {
  const severities = toArray(params.severity)
  const statuses = toArray(params.status)
  let out = items
  if (severities.length) out = out.filter((a) => severities.includes(a.severity_tier))
  if (statuses.length) out = out.filter((a) => statuses.includes(a.status))
  if (params.src_ip) out = out.filter((a) => a.src_ip === params.src_ip)
  if (params.dst_ip) out = out.filter((a) => a.dst_ip === params.dst_ip)
  if (params.ip) {
    out = out.filter((a) => matchesIpQuery(a.src_ip, params.ip) || matchesIpQuery(a.dst_ip, params.ip))
  }
  if (params.direction) out = out.filter((a) => a.direction === params.direction)
  if (params.dst_port != null && params.dst_port !== '') {
    out = out.filter((a) => a.dst_port === Number(params.dst_port))
  }
  if (params.mlp_label) out = out.filter((a) => a.mlp_label === params.mlp_label)
  if (params.signature_id != null && params.signature_id !== '') {
    out = out.filter((a) => a.suricata.signature_id === Number(params.signature_id))
  }
  if (params.signature) out = out.filter((a) => matchesSignature(a, params.signature))
  if (params.engine) out = out.filter((a) => matchesEngine(a, params.engine))
  if (params.evidence_quality) out = out.filter((a) => a.evidence_quality === params.evidence_quality)
  if (params.hide_noise) out = out.filter((a) => !a.likely_benign)
  if (params.hide_suppressed) out = out.filter((a) => !isSuppressed(a, rules))
  if (params.from) {
    const t = new Date(params.from).getTime()
    out = out.filter((a) => new Date(a.ts).getTime() >= t)
  }
  if (params.to) {
    const t = new Date(params.to).getTime()
    out = out.filter((a) => new Date(a.ts).getTime() <= t)
  }
  if (params.q) {
    const q = String(params.q).toLowerCase()
    out = out.filter((a) =>
      [a.id, a.flow_key, a.src_ip, a.dst_ip, a.mlp_label, a.suricata?.signature]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }
  return out
}

function applySort(items, sort) {
  const [field, dir] = String(sort || 'ts:desc')
    .replace(/^-/, '')
    .split(':')
  const direction = sort?.startsWith('-') ? 'desc' : dir === 'asc' ? 'asc' : 'desc'
  const factor = direction === 'asc' ? 1 : -1
  const valueOf = (a) =>
    field === 'severity_tier' ? SEVERITY_ORDER.indexOf(a.severity_tier) : a[field]
  return items.slice().sort((a, b) => {
    const av = valueOf(a)
    const bv = valueOf(b)
    if (av < bv) return -1 * factor
    if (av > bv) return 1 * factor
    return 0
  })
}

/**
 * List alerts with filtering, sorting and cursor pagination.
 * @param {object} [params] Query params mirroring the real API.
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function listAlerts(params = {}) {
  await delay()
  const rules = enabledSuppressions()
  const filtered = applyFilters(getAlerts().slice(), params, rules)
  const sorted = applySort(filtered, params.sort)
  const limit = Number(params.limit) || DEFAULT_LIMIT
  const page = paginate(sorted, { limit, cursor: params.cursor ?? null })
  return {
    data: page.items.map((alert) => ({
      ...cloneAlert(alert),
      suppressed: isSuppressed(alert, rules),
    })),
    meta: {
      total: page.total,
      limit,
      next_cursor: page.next_cursor,
      has_more: Boolean(page.next_cursor),
    },
  }
}

/**
 * Get a single alert by id.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getAlert(id) {
  await delay()
  return cloneAlert(findAlert(id)) ?? null
}

/**
 * Update a single alert.
 * @param {string} id Alert id.
 * @param {object} patch Fields to merge.
 * @returns {Promise<object|null>} Updated alert.
 */
export async function updateAlert(id, patch) {
  await delay()
  return cloneAlert(patchAlert(id, patch)) ?? null
}

/**
 * Apply the same patch to many alerts.
 * @param {string[]} ids Alert ids.
 * @param {object} patch Fields to merge.
 * @returns {Promise<{updated: number, ids: string[]}>}
 */
export async function bulkUpdate(ids, patch) {
  await delay()
  const updated = patchAlerts(ids, patch)
  return { updated, ids }
}

function toExportRow(alert, rules) {
  return {
    id: alert.id,
    ts: alert.ts,
    severity: alert.severity_tier,
    status: alert.status,
    src_ip: alert.src_ip ?? '',
    dst_ip: alert.dst_ip ?? '',
    dst_port: alert.dst_port ?? '',
    protocol: alert.protocol ?? '',
    direction: alert.direction ?? '',
    mlp_label: alert.mlp_label,
    mlp_confidence: alert.mlp_confidence,
    ae_ratio: alert.ae_ratio,
    signature: alert.suricata.signature,
    evidence_score: alert.evidence_score,
    assignee: alert.assignee ?? '',
    suppressed: isSuppressed(alert, rules),
  }
}

/**
 * Export the filtered alert view as CSV text (client-side in dummy mode).
 * @param {object} [params] The same filter params accepted by {@link listAlerts}.
 * @returns {Promise<string>} CSV content.
 */
export async function exportCsv(params = {}) {
  await delay()
  const rules = enabledSuppressions()
  const filtered = applyFilters(getAlerts().slice(), params, rules)
  const sorted = applySort(filtered, params.sort)
  const rows = sorted.map((alert) => toExportRow(alert, rules))
  return toCsv(rows, ALERT_EXPORT_COLUMNS)
}
