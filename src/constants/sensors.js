/**
 * Sensors page constants: freshness/health thresholds and list limits.
 * @module constants/sensors
 */

/** Kafka consumer lag (messages) above which a sensor is degraded. */
export const LAG_DEGRADED = 100
/** Kafka consumer lag (messages) above which a sensor is unhealthy. */
export const LAG_UNHEALTHY = 1000

/** Ingest errors above which a sensor is degraded. */
export const ERRORS_DEGRADED = 10
/** Ingest errors above which a sensor is unhealthy. */
export const ERRORS_UNHEALTHY = 100

/** Orphan Suricata events above which a sensor is degraded. */
export const ORPHAN_DEGRADED = 25

/** A sensor not seen for longer than this (ms) is considered stale/offline. */
export const SENSOR_STALE_MS = 120_000

/** Maximum number of orphan events rendered per sensor card. */
export const ORPHAN_EVENT_LIMIT = 6

/** Health states, ordered worst-last. */
export const SENSOR_HEALTH = Object.freeze({
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  OFFLINE: 'offline',
})
