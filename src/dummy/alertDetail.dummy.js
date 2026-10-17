/**
 * Dummy alert-detail resource (doc section 6.4): full flow, per-engine output,
 * explainability, enrichment, correlations and the 78-column feature vector.
 * @module dummy/alertDetail.dummy
 */

import { findAlert, getAlerts } from './store.js'
import { delay, hashString, rngFloat, rngInt, seededRandom } from './helpers.js'
import {
  ANOMALY_TOP_FEATURES,
  FLOW_NULL_SENTINEL,
  RELATED_ALERTS_LIMIT,
  RELATED_ALERTS_WINDOW_MS,
} from '../constants/alerts.js'
import { SURICATA_SIGNATURES } from '../constants/signatures.js'

/** The 78 CICFlowMeter feature columns used as model input. */
export const FEATURE_COLUMNS = Object.freeze([
  'Destination Port', 'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
  'Total Length of Fwd Packets', 'Total Length of Bwd Packets', 'Fwd Packet Length Max',
  'Fwd Packet Length Min', 'Fwd Packet Length Mean', 'Fwd Packet Length Std',
  'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean',
  'Bwd Packet Length Std', 'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
  'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min', 'Fwd IAT Total', 'Fwd IAT Mean',
  'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total', 'Bwd IAT Mean',
  'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min', 'Fwd PSH Flags', 'Bwd PSH Flags',
  'Fwd URG Flags', 'Bwd URG Flags', 'Fwd Header Length', 'Fwd Header Length.1',
  'Bwd Header Length', 'Fwd Packets/s', 'Bwd Packets/s', 'Min Packet Length',
  'Max Packet Length', 'Packet Length Mean', 'Packet Length Std', 'Packet Length Variance',
  'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count', 'ACK Flag Count',
  'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count', 'Down/Up Ratio', 'Average Packet Size',
  'Avg Fwd Segment Size', 'Avg Bwd Segment Size', 'Fwd Avg Bytes/Bulk', 'Fwd Avg Packets/Bulk',
  'Fwd Avg Bulk Rate', 'Bwd Avg Bytes/Bulk', 'Bwd Avg Packets/Bulk', 'Bwd Avg Bulk Rate',
  'Subflow Fwd Packets', 'Subflow Fwd Bytes', 'Subflow Bwd Packets', 'Subflow Bwd Bytes',
  'Init_Win_bytes_forward', 'Init_Win_bytes_backward', 'act_data_pkt_fwd',
  'min_seg_size_forward', 'Active Mean', 'Active Std', 'Active Max', 'Active Min',
  'Idle Mean', 'Idle Std', 'Idle Max', 'Idle Min',
])

const ASN_POOL = [
  { asn: 'AS8075', org: 'Microsoft Corporation', country: 'US' },
  { asn: 'AS16509', org: 'Amazon.com, Inc.', country: 'US' },
  { asn: 'AS13335', org: 'Cloudflare, Inc.', country: 'US' },
  { asn: 'AS15169', org: 'Google LLC', country: 'US' },
  { asn: 'AS4134', org: 'Chinanet', country: 'CN' },
  { asn: 'AS24940', org: 'Hetzner Online GmbH', country: 'DE' },
]

const WINDOW_BYTE_COLUMNS = ['Init_Win_bytes_forward', 'Init_Win_bytes_backward']
const PORT_MISMATCH_CHANCE = 0.2

function buildFeatureVector(rng, alert) {
  const vector = {}
  const zScores = {}
  for (const column of FEATURE_COLUMNS) {
    let value
    if (/flag count/i.test(column) || /flags$/i.test(column)) {
      value = rngInt(rng, 0, 3)
    } else if (column === 'Destination Port') {
      value = alert.dst_port ?? rngInt(rng, 1, 65535)
    } else if (/port/i.test(column)) {
      value = rngInt(rng, 1, 65535)
    } else if (WINDOW_BYTE_COLUMNS.includes(column)) {
      value = rng() < 0.5 ? FLOW_NULL_SENTINEL : rngInt(rng, 0, 65535)
    } else if (/duration|iat|idle|active/i.test(column)) {
      value = rngFloat(rng, 1, 5_000_000, 2)
    } else {
      value = rngFloat(rng, 0, 20_000)
    }
    vector[column] = value
    zScores[column] = rngFloat(rng, -3, 6, 3)
  }

  if (alert.dst_port && rng() < PORT_MISMATCH_CHANCE) {
    let other = rngInt(rng, 1, 65535)
    if (other === alert.dst_port) other = (alert.dst_port % 65535) + 1
    vector['Destination Port'] = other
  }

  return { vector, zScores }
}

/**
 * Build the deterministic 78-column CICFlowMeter feature vector for an alert.
 * Used by the analytics feature explorer so points match the alert detail view.
 * @param {object} alert Alert object.
 * @returns {Record<string, number>} Feature vector keyed by column name.
 */
export function buildAlertFeatureVector(alert) {
  const rng = seededRandom(hashString(alert.id))
  return buildFeatureVector(rng, alert).vector
}

function buildTopFeatures(rng, vector, zScores) {
  return FEATURE_COLUMNS.map((column) => ({
    feature: column,
    value: vector[column],
    z_score: zScores[column],
    contribution: rngFloat(rng, -0.2, 0.6, 4),
  }))
    .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
    .slice(0, ANOMALY_TOP_FEATURES)
}

function buildFlowRow(rng, alert, vector) {
  return {
    'Flow ID': alert.flow_key ?? 'decode',
    'Source IP': alert.src_ip ?? '0.0.0.0',
    'Source Port': rngInt(rng, 1024, 65535),
    'Destination IP': alert.dst_ip ?? '0.0.0.0',
    'Destination Port': alert.dst_port ?? 0,
    Protocol: alert.protocol,
    Timestamp: alert.ts,
    ...vector,
  }
}

function isCorrelated(alert, candidate) {
  const delta = Math.abs(new Date(candidate.ts).getTime() - new Date(alert.ts).getTime())
  const inWindow = delta <= RELATED_ALERTS_WINDOW_MS
  if (alert.incident_id && candidate.incident_id === alert.incident_id) return true
  if (!inWindow) return false
  const ips = [alert.src_ip, alert.dst_ip].filter(Boolean)
  const touchesIp = ips.some((ip) => candidate.src_ip === ip || candidate.dst_ip === ip)
  const sameSignature =
    alert.suricata && candidate.suricata?.signature_id === alert.suricata.signature_id
  return touchesIp || Boolean(sameSignature)
}

function buildRelated(alert, all) {
  if (!alert) return []
  const center = new Date(alert.ts).getTime()
  return all
    .filter((candidate) => candidate.id !== alert.id && isCorrelated(alert, candidate))
    .sort(
      (a, b) =>
        Math.abs(new Date(a.ts).getTime() - center) - Math.abs(new Date(b.ts).getTime() - center),
    )
    .slice(0, RELATED_ALERTS_LIMIT)
    .map((candidate) => ({
      id: candidate.id,
      ts: candidate.ts,
      severity_tier: candidate.severity_tier,
      status: candidate.status,
      mlp_label: candidate.mlp_label,
      src_ip: candidate.src_ip,
      dst_ip: candidate.dst_ip,
      dst_port: candidate.dst_port,
      signature: candidate.suricata?.signature ?? null,
      signature_id: candidate.suricata?.signature_id ?? null,
    }))
}

function buildCorrelatedEvents(rng, alert) {
  const start = new Date(alert.ts).getTime()
  return Array.from({ length: rngInt(rng, 2, 5) }, (_, i) => {
    const sig = SURICATA_SIGNATURES[rngInt(rng, 0, SURICATA_SIGNATURES.length - 1)]
    return {
      ts: new Date(start - i * rngInt(rng, 1000, 60_000)).toISOString(),
      signature: sig.signature,
      signature_id: sig.signature_id,
      src_ip: alert.src_ip,
      dst_ip: alert.dst_ip,
      dst_port: alert.dst_port,
    }
  })
}

/**
 * Build the full alert-detail object for the given id.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getAlertDetail(id) {
  await delay()
  const alert = findAlert(id)
  if (!alert) return null

  const rng = seededRandom(hashString(id))
  const { vector, zScores } = buildFeatureVector(rng, alert)
  const catalog = SURICATA_SIGNATURES.find((s) => s.signature_id === alert.suricata.signature_id)
  const total = rngInt(rng, 40, 400)
  const start = new Date(alert.ts).getTime()
  const durationUs = rngInt(rng, 1000, 30_000_000)
  const topFeatures = buildTopFeatures(rng, vector, zScores)

  return {
    ...structuredClone(alert),
    flow: {
      flow_key: alert.flow_key,
      src_ip: alert.src_ip,
      src_port: rngInt(rng, 1024, 65535),
      dst_ip: alert.dst_ip,
      dst_port: alert.dst_port,
      protocol: alert.protocol,
      direction: alert.direction,
      start_ts: alert.ts,
      end_ts: new Date(start + durationUs / 1000).toISOString(),
      duration_us: durationUs,
      packets: total,
      bytes: rngInt(rng, 64, 5_000_000),
    },
    engines: {
      suricata: {
        signature: alert.suricata.signature,
        signature_id: alert.suricata.signature_id,
        category: alert.suricata.category,
        severity: alert.suricata.severity,
        weight: catalog?.weight ?? 0.3,
        matched: Boolean(alert.src_ip),
      },
      mlp: {
        label: alert.mlp_label,
        confidence: alert.mlp_confidence,
        top_classes: [
          { label: alert.mlp_label, prob: alert.mlp_confidence },
          { label: 'BENIGN', prob: Math.round((1 - alert.mlp_confidence) * 1000) / 1000 },
        ],
      },
      autoencoder: {
        error: alert.ae_error,
        threshold: alert.ae_threshold,
        ratio: alert.ae_ratio,
        over_threshold: alert.ae_ratio >= 1,
      },
    },
    evidence_quality: alert.evidence_quality,
    explain: { top_features: topFeatures },
    enrichment: (() => {
      const entry = ASN_POOL[hashString(String(alert.dst_ip || 'orphan')) % ASN_POOL.length]
      return {
        asn: entry.asn,
        org: entry.org,
        country: entry.country,
        rdns: alert.dst_ip ? `ptr.${entry.asn.toLowerCase()}.example.net` : null,
      }
    })(),
    related_alerts: buildRelated(alert, getAlerts()),
    correlated_suricata_events: buildCorrelatedEvents(rng, alert),
    flow_row: buildFlowRow(rng, alert, vector),
    feature_vector: vector,
    feature_z: zScores,
  }
}

/**
 * Return only the explainability block for an alert.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getExplain(id) {
  const detail = await getAlertDetail(id)
  return detail ? detail.explain : null
}

/**
 * Return a capture window and BPF filter to retrieve the alert's packets.
 * @param {string} id Alert id.
 * @returns {Promise<{time_window: {from: string, to: string}, bpf_filter: string}|null>}
 */
export async function getPcapHint(id) {
  await delay()
  const alert = findAlert(id)
  if (!alert) return null
  const center = new Date(alert.ts).getTime()
  const bpfParts = []
  if (alert.src_ip) bpfParts.push(`host ${alert.src_ip}`)
  if (alert.dst_ip) bpfParts.push(`host ${alert.dst_ip}`)
  if (alert.dst_port) {
    bpfParts.push(`(${alert.protocol?.toLowerCase() === 'udp' ? 'udp' : 'tcp'} port ${alert.dst_port})`)
  }
  return {
    time_window: {
      from: new Date(center - 60_000).toISOString(),
      to: new Date(center + 60_000).toISOString(),
    },
    bpf_filter: bpfFilters(bpfParts),
  }
}

function bpfFilters(parts) {
  return parts.length ? parts.join(' and ') : 'ip or ip6'
}
