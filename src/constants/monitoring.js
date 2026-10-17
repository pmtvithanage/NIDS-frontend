/**
 * Real-time monitoring section constants (Overview "Live monitor").
 * @module constants/monitoring
 */

/** History window fetched for the monitor (minutes) — must cover the widest window. */
export const MONITOR_HISTORY_MINUTES = 60

/** Ring-buffer capacity shared by every live chart (~61 min at 1 point/s). */
export const MONITOR_MAX_POINTS = 3660

/** Selectable visible x-ranges (ms) for the chart dateWindow. */
export const MONITOR_WINDOWS = Object.freeze([
  { key: '1m', label: '1 min', ms: 60_000 },
  { key: '5m', label: '5 min', ms: 300_000 },
  { key: '15m', label: '15 min', ms: 900_000 },
  { key: '1h', label: '1 hour', ms: 3_600_000 },
])

/** Default visible window width (ms) matching MONITOR_WINDOWS. */
export const MONITOR_DEFAULT_WINDOW_MS = 300_000

/** Kafka consumer lag above which the chart shows a red zone. */
export const MONITOR_LAG_THRESHOLD = 1000

/** Autoencoder ratio considered "extreme". */
export const MONITOR_AE_EXTREME = 100

/** MLP confidence below which an alert is "likely noise" (AGENTS.md §5). */
export const MONITOR_MLP_NOISE_CUTOFF = 0.7

/** No metrics point for longer than this (ms) marks the feed as reconnecting. */
export const MONITOR_STALE_MS = 3500

/** Height (px) of the full-width model-confidence chart. */
export const MONITOR_CONFIDENCE_HEIGHT = 170

/** Trend comparison lookback for the stats strip (point = 1 s). */
export const MONITOR_TREND_POINTS = 60

/** Connection status keys for the status chip. */
export const MONITOR_STATUS = Object.freeze({
  LIVE: 'live',
  RECONNECTING: 'reconnecting',
  PAUSED: 'paused',
})

/** CSS color variables used by the live charts. */
export const MONITOR_COLORS = Object.freeze({
  critical: '--sev-critical',
  high: '--sev-high',
  medium: '--sev-medium',
  low: '--sev-low',
  flows: '--accent',
  bytes: '--sev-high',
  p50: '--sev-low',
  p95: '--sev-medium',
  max: '--sev-critical',
  lag: '--accent',
  errors: '--sev-critical',
  confidence: '--sev-low',
})
