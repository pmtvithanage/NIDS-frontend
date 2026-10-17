/**
 * Dummy real-time metrics feed.
 *
 * Produces a deterministic history window (with a scripted attack burst) and
 * then continues the same random walk live. Alert counts are folded in from the
 * shared store's ingest stream, so a CRITICAL alert emitted by `stream.dummy.js`
 * is reflected in the metrics point for that second.
 * @module dummy/metrics.dummy
 */

import { getAlerts, onAlertIngested } from './store.js'
import { delay, rngFloat, rngInt, seededRandom } from './helpers.js'
import { SEVERITY } from '../constants/severity.js'
import {
  AE_RATIO_MAX,
  AE_RATIO_MIN,
  AE_RATIO_SPIKE_CHANCE,
  AE_RATIO_SPIKE_MAX,
  AE_RATIO_SPIKE_MIN,
  BURST_AE_RATIO_MAX,
  BURST_AE_RATIO_MIN,
  BURST_ALERTS_MAX,
  BURST_ALERTS_MIN,
  BURST_FLOW_MULTIPLIER,
  BURST_KAFKA_MAX,
  BURST_KAFKA_MIN,
  BURST_MAX_MS,
  BURST_MLP_CONF_MAX,
  BURST_MLP_CONF_MIN,
  BURST_MIN_MS,
  BURST_RECUR_MAX_MS,
  BURST_RECUR_MIN_MS,
  BURST_START_BEFORE_MS,
  BURST_SURICATA_MAX,
  BURST_SURICATA_MIN,
  BYTES_PER_FLOW_MAX,
  BYTES_PER_FLOW_MIN,
  FLOWS_NOISE,
  FLOWS_PER_SEC_MAX,
  FLOWS_PER_SEC_MIN,
  FLOWS_WAVE_PERIOD_MS,
  INGEST_ERROR_CHANCE,
  INGEST_ERROR_MAX,
  INGEST_ERROR_MIN,
  KAFKA_LAG_MAX,
  KAFKA_LAG_MIN,
  METRICS_BURST_SEVERITY_WEIGHTS,
  METRICS_BUFFER_POINTS,
  METRICS_HISTORY_MINUTES,
  METRICS_HISTORY_SEED,
  METRICS_IDLE_SEVERITY_WEIGHTS,
  METRICS_SNAPSHOT_WINDOW_MS,
  METRICS_STEP_SECONDS,
  METRICS_STREAM_INTERVAL_MS,
  MLP_CONF_MAX,
  MLP_CONF_MIN,
  SURICATA_EVENTS_MAX,
  SURICATA_EVENTS_MIN,
} from '../constants/metrics.js'

/** Maps a severity tier to its alert-count bucket key. */
const SEVERITY_KEY = Object.freeze({
  [SEVERITY.CRITICAL]: 'critical',
  [SEVERITY.HIGH]: 'high',
  [SEVERITY.MEDIUM]: 'medium',
  [SEVERITY.LOW]: 'low',
})

/** @type {object[]} Rolling series shared by every read. */
let series = []

/** Live random-walk cursor, or null until the first point is produced. */
let live = null

/** Alerts ingested since the last emitted live point. */
const pendingAlerts = { critical: 0, high: 0, medium: 0, low: 0 }

/** @type {(() => void)|null} */
let ingestUnsubscribe = null

function zeroAlerts() {
  pendingAlerts.critical = 0
  pendingAlerts.high = 0
  pendingAlerts.medium = 0
  pendingAlerts.low = 0
}

function addAlerts(target, extra) {
  target.critical += extra.critical
  target.high += extra.high
  target.medium += extra.medium
  target.low += extra.low
  return target
}

function round(value, digits) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function ensureIngest() {
  if (ingestUnsubscribe) return
  ingestUnsubscribe = onAlertIngested((alert) => {
    const key = SEVERITY_KEY[alert.severity_tier]
    if (key) pendingAlerts[key] += 1
  })
}

function weightedSeverity(rng, weights) {
  const roll = rng()
  let acc = 0
  for (const [key, weight] of weights) {
    acc += weight
    if (roll < acc) return key
  }
  return weights[weights.length - 1][0]
}

function buildAlerts(rng, burst) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  const total = burst
    ? rngInt(rng, BURST_ALERTS_MIN, BURST_ALERTS_MAX)
    : rngInt(rng, 0, 3)
  const weights = burst ? METRICS_BURST_SEVERITY_WEIGHTS : METRICS_IDLE_SEVERITY_WEIGHTS
  for (let i = 0; i < total; i += 1) counts[weightedSeverity(rng, weights)] += 1
  return counts
}

function buildAeRatios(rng, burst) {
  let max
  if (burst) {
    max = rngFloat(rng, BURST_AE_RATIO_MIN, BURST_AE_RATIO_MAX, 2)
  } else if (rng() < AE_RATIO_SPIKE_CHANCE) {
    max = rngFloat(rng, AE_RATIO_SPIKE_MIN, AE_RATIO_SPIKE_MAX, 2)
  } else {
    max = rngFloat(rng, AE_RATIO_MIN, AE_RATIO_MAX, 2)
  }
  const p95 = round(max * rngFloat(rng, 0.3, 0.8, 4), 2)
  const p50 = round(p95 * rngFloat(rng, 0.2, 0.7, 4), 2)
  return { p50, p95, max }
}

function buildPoint(ms, state, burst, rng, extraAlerts) {
  const wave = Math.sin((2 * Math.PI * ms) / FLOWS_WAVE_PERIOD_MS + state.phase)
  const mid = (FLOWS_PER_SEC_MIN + FLOWS_PER_SEC_MAX) / 2
  const amp = (FLOWS_PER_SEC_MAX - FLOWS_PER_SEC_MIN) / 2
  let flows = mid + amp * wave
  flows *= 1 + (rng() - 0.5) * 2 * FLOWS_NOISE
  if (burst) flows *= BURST_FLOW_MULTIPLIER * (0.85 + rng() * 0.3)
  flows = round(Math.max(0, flows), 1)

  const bytesPerFlow = rngFloat(rng, BYTES_PER_FLOW_MIN, BYTES_PER_FLOW_MAX, 0)
  const alerts = buildAlerts(rng, burst)
  if (extraAlerts) addAlerts(alerts, extraAlerts)

  const ae = buildAeRatios(rng, burst)
  const mlp = burst
    ? rngFloat(rng, BURST_MLP_CONF_MIN, BURST_MLP_CONF_MAX, 3)
    : rngFloat(rng, MLP_CONF_MIN, MLP_CONF_MAX, 3)
  const suricata = burst
    ? rngInt(rng, BURST_SURICATA_MIN, BURST_SURICATA_MAX)
    : rngInt(rng, SURICATA_EVENTS_MIN, SURICATA_EVENTS_MAX)

  if (burst) {
    state.kafka = Math.min(KAFKA_LAG_MAX, state.kafka + rngInt(rng, 5, 25))
  } else {
    state.kafka = Math.min(KAFKA_LAG_MAX, Math.max(KAFKA_LAG_MIN, state.kafka + rngInt(rng, -8, 6)))
  }

  const errors = rng() < INGEST_ERROR_CHANCE ? rngInt(rng, INGEST_ERROR_MIN, INGEST_ERROR_MAX) : 0

  return {
    ts: new Date(ms).toISOString(),
    alerts,
    flows_per_sec: flows,
    bytes_per_sec: Math.round(flows * bytesPerFlow),
    ae_ratio_p50: ae.p50,
    ae_ratio_p95: ae.p95,
    ae_ratio_max: ae.max,
    mlp_conf_avg: mlp,
    suricata_events_per_sec: suricata,
    kafka_lag: Math.round(state.kafka),
    ingest_errors: errors,
  }
}

function overlayStoreAlerts(points, startMs, stepMs) {
  const endMs = startMs + (points.length - 1) * stepMs
  for (const alert of getAlerts()) {
    const ms = new Date(alert.ts).getTime()
    if (ms < startMs || ms > endMs) continue
    const key = SEVERITY_KEY[alert.severity_tier]
    const point = points[Math.round((ms - startMs) / stepMs)]
    if (key && point) point.alerts[key] += 1
  }
}

function seedLiveState(lastPoint, alignedNow, phase, rng) {
  return {
    ts: new Date(lastPoint.ts).getTime(),
    phase,
    kafka: lastPoint.kafka_lag,
    nextBurstAt: alignedNow + rngInt(rng, BURST_RECUR_MIN_MS, BURST_RECUR_MAX_MS),
    burstUntil: 0,
  }
}

/**
 * Historical metrics, one point per step, going back `minutes`.
 * @param {{minutes?: number, stepSeconds?: number}} [params]
 * @returns {Promise<object[]>} Ordered oldest-first.
 */
export async function getMetricsHistory(params = {}) {
  await delay()
  ensureIngest()
  const minutes = params.minutes ?? METRICS_HISTORY_MINUTES
  const stepSeconds = params.stepSeconds ?? METRICS_STEP_SECONDS
  const stepMs = Math.max(1, stepSeconds) * 1000
  const alignedNow = Math.floor(Date.now() / stepMs) * stepMs
  const count = Math.max(1, Math.floor((minutes * 60_000) / stepMs))
  const startMs = alignedNow - count * stepMs

  const rng = seededRandom(METRICS_HISTORY_SEED)
  const state = { phase: rng() * Math.PI * 2, kafka: rngInt(rng, 10, 60) }
  const scriptedStart = alignedNow - BURST_START_BEFORE_MS
  const scriptedEnd = scriptedStart + rngInt(rng, BURST_MIN_MS, BURST_MAX_MS)

  const points = []
  for (let i = 0; i <= count; i += 1) {
    const ms = startMs + i * stepMs
    const burst = ms >= scriptedStart && ms < scriptedEnd
    points.push(buildPoint(ms, state, burst, rng, null))
  }

  overlayStoreAlerts(points, startMs, stepMs)

  series = points
  live = seedLiveState(points[points.length - 1], alignedNow, state.phase, rng)
  return points
}

function nextLivePoint() {
  ensureIngest()
  if (!live) {
    const alignedNow = Math.floor(Date.now() / 1000) * 1000
    live = {
      ts: alignedNow,
      phase: Math.random() * Math.PI * 2,
      kafka: rngInt(Math.random, KAFKA_LAG_MIN, 60),
      nextBurstAt: alignedNow + rngInt(Math.random, BURST_RECUR_MIN_MS, BURST_RECUR_MAX_MS),
      burstUntil: 0,
    }
  }
  const wallClock = Date.now()
  let ms = live.ts + 1000
  if (wallClock - ms > METRICS_STREAM_INTERVAL_MS * 5) ms = Math.floor(wallClock / 1000) * 1000
  if (ms >= live.nextBurstAt) {
    live.burstUntil = ms + rngInt(Math.random, BURST_MIN_MS, BURST_MAX_MS)
    live.nextBurstAt = live.burstUntil + rngInt(Math.random, BURST_RECUR_MIN_MS, BURST_RECUR_MAX_MS)
    live.kafka = rngInt(Math.random, BURST_KAFKA_MIN, BURST_KAFKA_MAX)
  }
  const burst = ms < live.burstUntil
  const point = buildPoint(ms, live, burst, Math.random, pendingAlerts)
  zeroAlerts()
  live.ts = ms
  series.push(point)
  if (series.length > METRICS_BUFFER_POINTS) series = series.slice(-METRICS_BUFFER_POINTS)
  return point
}

/**
 * Subscribe to the live metrics feed.
 * @param {(point: object) => void} onPoint Callback per emitted point.
 * @param {{intervalMs?: number}} [options]
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeMetrics(onPoint, options = {}) {
  const intervalMs = options.intervalMs ?? METRICS_STREAM_INTERVAL_MS
  ensureIngest()
  const id = setInterval(() => {
    if (typeof onPoint === 'function') onPoint(nextLivePoint())
  }, intervalMs)
  return () => clearInterval(id)
}

/**
 * Latest metrics point plus alert/flow counters over the snapshot window.
 * @returns {Promise<object>}
 */
export async function getCurrentSnapshot() {
  await delay()
  if (series.length === 0) await getMetricsHistory({ minutes: METRICS_HISTORY_MINUTES })
  const latest = series[series.length - 1]
  const cutoff = Date.now() - METRICS_SNAPSHOT_WINDOW_MS
  const recent = series.filter((point) => new Date(point.ts).getTime() >= cutoff)

  const alerts = { critical: 0, high: 0, medium: 0, low: 0 }
  let flows = 0
  let bytes = 0
  for (const point of recent) {
    addAlerts(alerts, point.alerts)
    flows += point.flows_per_sec
    bytes += point.bytes_per_sec
  }
  const total = alerts.critical + alerts.high + alerts.medium + alerts.low

  return {
    ...latest,
    alerts_last_5m: { ...alerts, total },
    flows_last_5m: Math.round(flows),
    bytes_last_5m: Math.round(bytes),
    window_seconds: METRICS_SNAPSHOT_WINDOW_MS / 1000,
  }
}
