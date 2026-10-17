/**
 * Real-time metrics feed constants: history window, streaming cadence,
 * generator ranges and rolling-buffer caps shared by the dummy layer and hooks.
 * @module constants/metrics
 */

/** Default number of minutes returned by `getMetricsHistory`. */
export const METRICS_HISTORY_MINUTES = 15

/** Default spacing between history points, in seconds. */
export const METRICS_STEP_SECONDS = 1

/** Default cadence of the live metrics stream (ms). */
export const METRICS_STREAM_INTERVAL_MS = 1000

/** Maximum points retained by the live rolling buffer (~16 min at 1/s). */
export const METRICS_BUFFER_POINTS = 960

/** The latest point is pushed into React state at most this often (ms). */
export const METRICS_FLUSH_MS = 1000

/** Aggregation window used by `getCurrentSnapshot` (ms). */
export const METRICS_SNAPSHOT_WINDOW_MS = 5 * 60 * 1000

/** Seed for the deterministic history generator. */
export const METRICS_HISTORY_SEED = 0x4e494453

/** Flows-per-second baseline (slow sine wave). */
export const FLOWS_PER_SEC_MIN = 20
export const FLOWS_PER_SEC_MAX = 120

/** Period of the flow sine wave (ms). */
export const FLOWS_WAVE_PERIOD_MS = 120_000

/** Fractional noise added to the flow wave. */
export const FLOWS_NOISE = 0.18

/** Average bytes carried by one flow. */
export const BYTES_PER_FLOW_MIN = 600
export const BYTES_PER_FLOW_MAX = 2400

/** Suricata events per second when idle. */
export const SURICATA_EVENTS_MIN = 5
export const SURICATA_EVENTS_MAX = 60

/** Autoencoder error/threshold ratio when idle (mostly 0.2-5). */
export const AE_RATIO_MIN = 0.2
export const AE_RATIO_MAX = 5

/** Rare single-second autoencoder spike. */
export const AE_RATIO_SPIKE_MIN = 100
export const AE_RATIO_SPIKE_MAX = 480
export const AE_RATIO_SPIKE_CHANCE = 0.01

/** Average MLP confidence when idle. */
export const MLP_CONF_MIN = 0.6
export const MLP_CONF_MAX = 0.99

/** Kafka consumer lag random-walk bounds. */
export const KAFKA_LAG_MIN = 0
export const KAFKA_LAG_MAX = 300

/** Probability and size of a per-second ingest error count. */
export const INGEST_ERROR_CHANCE = 0.02
export const INGEST_ERROR_MIN = 1
export const INGEST_ERROR_MAX = 3

/** Scripted burst: starts this long before "now" and lasts 30-40 s. */
export const BURST_START_BEFORE_MS = 4 * 60 * 1000
export const BURST_MIN_MS = 30_000
export const BURST_MAX_MS = 40_000

/** Live bursts recur every ~2 minutes. */
export const BURST_RECUR_MIN_MS = 90_000
export const BURST_RECUR_MAX_MS = 150_000

/** Attack-burst magnitudes (alerts, flows, AE ratio, lag, MLP confidence). */
export const BURST_ALERTS_MIN = 6
export const BURST_ALERTS_MAX = 14
export const BURST_FLOW_MULTIPLIER = 3
export const BURST_SURICATA_MIN = 80
export const BURST_SURICATA_MAX = 260
export const BURST_AE_RATIO_MIN = 60
export const BURST_AE_RATIO_MAX = 260
export const BURST_KAFKA_MIN = 180
export const BURST_KAFKA_MAX = 300
export const BURST_MLP_CONF_MIN = 0.35
export const BURST_MLP_CONF_MAX = 0.62

/** Relative likelihood of each severity during normal and bursty seconds. */
export const METRICS_IDLE_SEVERITY_WEIGHTS = Object.freeze([
  ['low', 0.55],
  ['medium', 0.3],
  ['high', 0.12],
  ['critical', 0.03],
])

/** @type {ReadonlyArray<[string, number]>} */
export const METRICS_BURST_SEVERITY_WEIGHTS = Object.freeze([
  ['critical', 0.35],
  ['high', 0.4],
  ['medium', 0.17],
  ['low', 0.08],
])
