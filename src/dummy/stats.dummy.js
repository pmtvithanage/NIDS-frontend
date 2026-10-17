/**
 * Dummy stats resource. Every figure is derived from the shared in-memory
 * alerts so it always matches the alerts list.
 * @module dummy/stats.dummy
 */

import { buildAlertFeatureVector } from './alertDetail.dummy.js'
import { getAlerts } from './store.js'
import { delay } from './helpers.js'
import { FLOW_NULL_SENTINEL } from '../constants/alerts.js'
import { LABELS } from '../constants/labels.js'
import { SEVERITY, SEVERITY_ORDER, SEVERITY_RANK } from '../constants/severity.js'
import {
  DETECTION_AE_RATIO,
  DRIFT_FLAG_RATIO,
  FUSION_AE_STRONG,
  FUSION_AE_WEAK,
  FUSION_ENGINES,
  FUSION_EXAMPLE_LIMIT,
  FUSION_MLP_STRONG,
  FUSION_MLP_WEAK,
  FUSION_SURICATA_STRONG,
  FUSION_SURICATA_WEAK,
  MODEL_DRIFT_FEATURES,
  MODEL_FEATURE_SAMPLE,
  PRECISION_BUCKET_DAYS,
} from '../constants/models.js'
import { signatureWeight } from '../utils/evidence.js'

const HOUR_MS = 3_600_000
const SIX_HOURS_MS = 6 * HOUR_MS
const DAY_MS = 24 * HOUR_MS
const CONFIDENCE_BINS = 10
const AE_BINS = [0, 0.05, 0.1, 0.2, 0.5, 1, 5, 10, 50, 100, 500]
const INTERVAL_MS = { hour: HOUR_MS, '6h': SIX_HOURS_MS, day: DAY_MS }
const TRIAGE_FAST_SEC = 45
const TRIAGE_SLOW_SEC = 5_400

function isAttackLabel(alert) {
  return alert.mlp_label !== 'BENIGN' && alert.mlp_confidence >= 0.5
}
function isSuricataAttack(alert) {
  return signatureWeight(alert.suricata.category) >= 0.3
}

/** Bounds of the summary window; defaults to the last 24 hours. */
function resolveWindow(params, now) {
  const to = params.to ? new Date(params.to).getTime() : now
  const from = params.from ? new Date(params.from).getTime() : to - DAY_MS
  return { from, to }
}

/**
 * Deterministic triage-time proxy (seconds) used until the backend exposes
 * real first-review timestamps. Higher severities are reviewed faster.
 * @param {object} alert Alert object.
 * @returns {number} Proxy triage duration in seconds.
 */
function triageSecondsFor(alert) {
  let hash = 0
  const id = String(alert.id)
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0
  const rank = SEVERITY_RANK[alert.severity_tier] ?? 0
  const urgency = rank / (SEVERITY_ORDER.length - 1)
  const span = TRIAGE_SLOW_SEC - TRIAGE_FAST_SEC
  const jitter = (Math.abs(hash) % 1000) / 1000
  return Math.round(TRIAGE_FAST_SEC + span * (1 - urgency) * (0.5 + 0.5 * jitter))
}

/**
 * High-level KPI summary for a time window.
 * @param {{from?: string, to?: string}} [params] Window bounds (ISO); defaults
 *   to the last 24 hours. `previous_total_alerts` counts the equally-sized
 *   window immediately before `from` for period-over-period comparisons.
 * @returns {Promise<object>}
 */
export async function getSummary(params = {}) {
  await delay()
  const alerts = getAlerts()
  const now = Date.now()
  const { from, to } = resolveWindow(params, now)
  const span = Math.max(to - from, 1)
  const inWindow = alerts.filter((alert) => {
    const t = new Date(alert.ts).getTime()
    return t >= from && t <= to
  })
  const previous = alerts.filter((alert) => {
    const t = new Date(alert.ts).getTime()
    return t >= from - span && t < from
  })

  const by_severity = Object.fromEntries(SEVERITY_ORDER.map((tier) => [tier, 0]))
  const by_status = {}
  const by_label = Object.fromEntries(LABELS.map((label) => [label, 0]))
  const incidents = new Set()
  let benign = 0
  let noise = 0
  let evidenceSum = 0
  let critical_unreviewed = 0
  let critical_low_evidence = 0
  let triageSum = 0
  let triaged = 0

  for (const alert of inWindow) {
    by_severity[alert.severity_tier] += 1
    by_status[alert.status] = (by_status[alert.status] ?? 0) + 1
    if (by_label[alert.mlp_label] === undefined) by_label[alert.mlp_label] = 0
    by_label[alert.mlp_label] += 1
    if (alert.incident_id) incidents.add(alert.incident_id)
    if (alert.mlp_label === 'BENIGN') benign += 1
    if (alert.likely_benign) noise += 1
    evidenceSum += alert.evidence_score
    if (alert.severity_tier === SEVERITY.CRITICAL) {
      if (alert.status === 'new') critical_unreviewed += 1
      if (alert.evidence_quality === 'low') critical_low_evidence += 1
    }
    if (alert.status !== 'new') {
      triageSum += triageSecondsFor(alert)
      triaged += 1
    }
  }

  let last24h = 0
  for (const alert of alerts) {
    if (now - new Date(alert.ts).getTime() <= DAY_MS) last24h += 1
  }

  return {
    total_alerts: inWindow.length,
    previous_total_alerts: previous.length,
    benign,
    malicious: inWindow.length - benign,
    noise_ratio: inWindow.length ? Math.round((noise / inWindow.length) * 1000) / 1000 : 0,
    open_alerts: inWindow.filter((a) => !['resolved', 'false_positive'].includes(a.status)).length,
    open_incidents: incidents.size,
    ingested_last_24h: last24h,
    avg_evidence_score: inWindow.length
      ? Math.round((evidenceSum / inWindow.length) * 100) / 100
      : 0,
    critical_unreviewed,
    critical_low_evidence,
    mean_triage_seconds: triaged ? Math.round(triageSum / triaged) : null,
    by_severity,
    by_status,
    by_label,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    generated_at: new Date().toISOString(),
  }
}

function bucketKey(ts, interval) {
  const size = INTERVAL_MS[interval] ?? HOUR_MS
  return new Date(Math.floor(new Date(ts).getTime() / size) * size).toISOString()
}

/**
 * Time series of alert counts.
 * @param {{interval?: 'hour'|'6h'|'day', from?: string, to?: string, group_by?: 'severity'|'label'|null}} [params]
 * @returns {Promise<object>}
 */
export async function getTimeseries(params = {}) {
  await delay()
  const interval = INTERVAL_MS[params.interval] ? params.interval : 'hour'
  const group_by = params.group_by ?? null
  const to = params.to ? new Date(params.to).getTime() : Date.now()
  const span = interval === 'day' ? 7 * DAY_MS : interval === '6h' ? 2 * DAY_MS : DAY_MS
  const from = params.from ? new Date(params.from).getTime() : to - span
  const buckets = new Map()

  for (const alert of getAlerts()) {
    const t = new Date(alert.ts).getTime()
    if (t < from || t > to) continue
    const key = bucketKey(alert.ts, interval)
    if (!buckets.has(key)) buckets.set(key, { ts: key, total: 0, groups: {} })
    const bucket = buckets.get(key)
    bucket.total += 1
    if (group_by === 'severity') {
      bucket.groups[alert.severity_tier] = (bucket.groups[alert.severity_tier] ?? 0) + 1
    } else if (group_by === 'label') {
      bucket.groups[alert.mlp_label] = (bucket.groups[alert.mlp_label] ?? 0) + 1
    }
  }

  const points = [...buckets.values()].sort((a, b) => new Date(a.ts) - new Date(b.ts))
  return {
    interval,
    group_by,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    points,
  }
}

/**
 * Top-N breakdown of alerts by a chosen dimension.
 * @param {{by?: string, limit?: number}} [params]
 * @returns {Promise<{by: string, data: Array<{key: string, count: number, label: string}>}>}
 */
export async function getTop(params = {}) {
  await delay()
  const by = params.by ?? 'signature_id'
  const limit = params.limit ?? 10
  const counts = new Map()

  for (const alert of getAlerts()) {
    let key
    if (by === 'signature_id') key = String(alert.suricata.signature_id)
    else if (by === 'signature') key = alert.suricata.signature
    else key = String(alert[by] ?? 'unknown')
    const entry = counts.get(key) ?? { key, count: 0, label: key }
    entry.count += 1
    counts.set(key, entry)
  }

  const data = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit)
  return { by, data }
}

/** Count each three-engine combination seen across the alert set. */
function engineComboRows(alerts) {
  const defs = [
    { key: 'all_three', label: 'All three engines', test: (s, m, e) => s && m && e },
    { key: 'suricata_ae', label: 'Suricata + anomaly', test: (s, m, e) => s && e && !m },
    { key: 'mlp_ae', label: 'MLP + anomaly', test: (s, m, e) => m && e && !s },
    { key: 'suricata_only', label: 'Suricata only', test: (s, m, e) => s && !m && !e },
    { key: 'ae_only', label: 'Anomaly only', test: (s, m, e) => e && !s && !m },
  ]
  const rows = defs.map((def) => ({ key: def.key, label: def.label, count: 0 }))
  for (const alert of alerts) {
    const signals = detectionSignals(alert)
    const index = defs.findIndex((def) => def.test(signals.suricata, signals.mlp, signals.ae))
    if (index >= 0) rows[index].count += 1
  }
  return rows
}

/**
 * Suricata vs MLP agreement matrix plus a three-engine combination breakdown.
 * @returns {Promise<object>}
 */
export async function getEngineAgreement() {
  await delay()
  let both = 0
  let suricata_only = 0
  let mlp_only = 0
  let neither = 0
  for (const alert of getAlerts()) {
    const s = isSuricataAttack(alert)
    const m = isAttackLabel(alert)
    if (s && m) both += 1
    else if (s) suricata_only += 1
    else if (m) mlp_only += 1
    else neither += 1
  }
  const total = both + suricata_only + mlp_only + neither
  return {
    both,
    suricata_only,
    mlp_only,
    neither,
    total,
    agreement_rate: total ? Math.round(((both + neither) / total) * 1000) / 1000 : 0,
    combos: engineComboRows(getAlerts()),
  }
}

/**
 * Analyst feedback (precision proxy) per engine, based on alert status.
 * @returns {Promise<object>}
 */
export async function getEngineFeedback() {
  await delay()
  const score = { suricata: { tp: 0, fp: 0 }, mlp: { tp: 0, fp: 0 }, ae: { tp: 0, fp: 0 } }
  for (const alert of getAlerts()) {
    if (alert.status === 'confirmed' || alert.status === 'resolved') {
      score.suricata.tp += 1
      score.mlp.tp += 1
      score.ae.tp += 1
    } else if (alert.status === 'false_positive') {
      score.suricata.fp += 1
      score.mlp.fp += 1
      score.ae.fp += 1
    }
  }
  for (const key of Object.keys(score)) {
    const { tp, fp } = score[key]
    score[key].total = tp + fp
    score[key].precision = tp + fp ? Math.round((tp / (tp + fp)) * 1000) / 1000 : null
  }
  return { engines: score, labels_submitted: getAlerts().filter((a) => a.status === 'confirmed').length, generated_at: new Date().toISOString() }
}

/**
 * Model insight charts: label distribution, confidence + AE histograms,
 * feature drift, per-engine precision/recall over time and a fusion review.
 * @returns {Promise<object>}
 */
export async function getModelInsights() {
  await delay()
  const alerts = getAlerts()
  const labelCounts = {}
  for (const label of LABELS) labelCounts[label] = 0
  const confidence = Array.from({ length: CONFIDENCE_BINS }, (_, i) => ({
    bin: `${(i / CONFIDENCE_BINS).toFixed(1)}-${((i + 1) / CONFIDENCE_BINS).toFixed(1)}`,
    count: 0,
  }))
  const ae = AE_BINS.slice(0, -1).map((lo, i) => ({
    range: [lo, AE_BINS[i + 1]],
    label: `${lo}-${AE_BINS[i + 1]}`,
    count: 0,
  }))
  let threshold = 0

  for (const alert of alerts) {
    if (labelCounts[alert.mlp_label] === undefined) labelCounts[alert.mlp_label] = 0
    labelCounts[alert.mlp_label] += 1
    threshold = alert.ae_threshold
    confidence[Math.min(Math.floor(alert.mlp_confidence * CONFIDENCE_BINS), CONFIDENCE_BINS - 1)].count += 1
    const idx = AE_BINS.findIndex((v, i) => i < AE_BINS.length - 1 && alert.ae_error >= v && alert.ae_error < AE_BINS[i + 1])
    if (idx >= 0) ae[idx].count += 1
  }

  return {
    label_distribution: Object.entries(labelCounts).map(([label, count]) => ({ label, count })),
    confidence_histogram: confidence,
    ae_error_histogram: {
      threshold,
      bins: ae.map((b) => ({ range: b.range, label: b.label, count: b.count, over_threshold: b.range[0] >= threshold })),
    },
    feature_drift: buildFeatureDrift(alerts),
    precision_over_time: buildPrecisionOverTime(alerts, PRECISION_BUCKET_DAYS),
    fusion_review: buildFusionReview(alerts),
    generated_at: new Date().toISOString(),
  }
}

/** Mean of one feature across vectors, skipping nulls and non-finite values. */
function featureMean(vectors, feature) {
  let sum = 0
  let n = 0
  for (const vector of vectors) {
    const value = vector[feature]
    if (value == null || value === FLOW_NULL_SENTINEL || !Number.isFinite(value)) continue
    sum += value
    n += 1
  }
  return n ? sum / n : 0
}

/** Compare a recent window against an earlier baseline for each tracked feature. */
function buildFeatureDrift(alerts) {
  const sampled = alerts.slice(0, MODEL_FEATURE_SAMPLE)
  const half = Math.floor(sampled.length / 2)
  const current = sampled.slice(0, half).map((alert) => buildAlertFeatureVector(alert))
  const baseline = sampled.slice(half).map((alert) => buildAlertFeatureVector(alert))

  return MODEL_DRIFT_FEATURES.map((feature) => {
    const currentMean = featureMean(current, feature)
    const baselineMean = featureMean(baseline, feature)
    const delta = baselineMean ? (currentMean - baselineMean) / baselineMean : 0
    return {
      feature,
      baseline: Math.round(baselineMean * 1000) / 1000,
      mean: Math.round(currentMean * 1000) / 1000,
      drift: Math.round(delta * 1000) / 1000,
      direction: delta > 0.001 ? 'up' : delta < -0.001 ? 'down' : 'stable',
      drifted: Math.abs(delta) >= DRIFT_FLAG_RATIO,
    }
  })
}

/** Which engines fired on an alert, per their detection thresholds. */
function detectionSignals(alert) {
  return {
    suricata: isSuricataAttack(alert),
    mlp: isAttackLabel(alert),
    ae: alert.ae_ratio >= DETECTION_AE_RATIO,
  }
}

/** Per-engine precision/recall grouped by UTC day, from analyst verdicts. */
function buildPrecisionOverTime(alerts, days) {
  const cutoff = Date.now() - days * DAY_MS
  const buckets = new Map()

  for (const alert of alerts) {
    const t = new Date(alert.ts).getTime()
    if (t < cutoff) continue
    const positive = alert.status === 'confirmed' || alert.status === 'resolved'
    const negative = alert.status === 'false_positive'
    if (!positive && !negative) continue

    const key = new Date(alert.ts).toISOString().slice(0, 10)
    if (!buckets.has(key)) {
      buckets.set(key, {
        day: key,
        engines: Object.fromEntries(FUSION_ENGINES.map((engine) => [engine, { tp: 0, fp: 0, fn: 0 }])),
      })
    }
    const bucket = buckets.get(key)
    const signals = detectionSignals(alert)
    for (const engine of FUSION_ENGINES) {
      const cell = bucket.engines[engine]
      if (positive && signals[engine]) cell.tp += 1
      else if (positive) cell.fn += 1
      else if (signals[engine]) cell.fp += 1
    }
  }

  return [...buckets.values()]
    .sort((a, b) => (a.day < b.day ? -1 : 1))
    .map((bucket) => ({
      day: bucket.day,
      engines: Object.fromEntries(
        FUSION_ENGINES.map((engine) => {
          const { tp, fp, fn } = bucket.engines[engine]
          return [
            engine,
            {
              precision: tp + fp ? Math.round((tp / (tp + fp)) * 1000) / 1000 : null,
              recall: tp + fn ? Math.round((tp / (tp + fn)) * 1000) / 1000 : null,
              tp,
              fp,
              fn,
            },
          ]
        }),
      ),
    }))
}

/** Engines strong enough to have driven a CRITICAL verdict on their own. */
function criticalDrivers(alert) {
  const drivers = []
  if (signatureWeight(alert.suricata?.category) >= FUSION_SURICATA_STRONG) drivers.push('suricata')
  if (alert.mlp_confidence >= FUSION_MLP_STRONG) drivers.push('mlp')
  if (alert.ae_ratio >= FUSION_AE_STRONG) drivers.push('ae')
  return drivers
}

/** Whether a lone driving engine sits at the low end of its strong range. */
function isWeakDriver(alert, engine) {
  if (engine === 'suricata') return signatureWeight(alert.suricata?.category) < FUSION_SURICATA_WEAK
  if (engine === 'mlp') return alert.mlp_confidence < FUSION_MLP_WEAK
  return alert.ae_ratio < FUSION_AE_WEAK
}

/** Review how often CRITICAL verdicts rested on a single (possibly weak) engine. */
function buildFusionReview(alerts) {
  const critical = alerts.filter((alert) => alert.severity_tier === 'CRITICAL')
  const byEngine = Object.fromEntries(FUSION_ENGINES.map((engine) => [engine, 0]))
  let singleEngine = 0
  let singleWeak = 0
  const examples = []

  for (const alert of critical) {
    const drivers = criticalDrivers(alert)
    if (drivers.length !== 1) continue
    const only = drivers[0]
    singleEngine += 1
    byEngine[only] += 1
    if (isWeakDriver(alert, only)) {
      singleWeak += 1
      if (examples.length < FUSION_EXAMPLE_LIMIT) examples.push({ id: alert.id, engine: only })
    }
  }

  return {
    critical_total: critical.length,
    single_engine: singleEngine,
    single_weak: singleWeak,
    single_engine_share: critical.length ? Math.round((singleEngine / critical.length) * 1000) / 1000 : 0,
    single_weak_share: critical.length ? Math.round((singleWeak / critical.length) * 1000) / 1000 : 0,
    by_engine: FUSION_ENGINES.map((engine) => ({ engine, count: byEngine[engine] })),
    examples,
  }
}
import { getCommunicationGraph as graphGetCommunicationGraph } from './graph.dummy.js'

/**
 * Communication graph between hosts (who talks to whom). Derived from recent
 * alerts in the shared store.
 * @param {{minutes?: number}} [params]
 * @returns {Promise<object>}
 */
export async function getCommunicationGraph(params = {}) {
  return graphGetCommunicationGraph(params)
}
