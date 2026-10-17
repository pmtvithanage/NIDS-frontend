/**
 * Dummy sensors resource. Metrics are inflated with live counts from the
 * shared alert store where relevant, and a health verdict is derived from
 * consumer lag, ingest errors, orphan events and freshness.
 * @module dummy/sensors.dummy
 */

import { getAlerts, getState } from './store.js'
import { delay } from './helpers.js'
import {
  ERRORS_DEGRADED,
  ERRORS_UNHEALTHY,
  LAG_DEGRADED,
  LAG_UNHEALTHY,
  ORPHAN_DEGRADED,
  ORPHAN_EVENT_LIMIT,
  SENSOR_HEALTH,
  SENSOR_STALE_MS,
} from '../constants/sensors.js'

const WINDOW_MS = 60_000

function healthFor(sensor, now) {
  if (sensor.status === 'offline') return SENSOR_HEALTH.OFFLINE
  if (now - new Date(sensor.last_seen).getTime() > SENSOR_STALE_MS) return SENSOR_HEALTH.OFFLINE
  if (sensor.kafka_lag > LAG_UNHEALTHY || sensor.ingest_errors > ERRORS_UNHEALTHY) {
    return SENSOR_HEALTH.UNHEALTHY
  }
  if (
    sensor.kafka_lag > LAG_DEGRADED ||
    sensor.ingest_errors > ERRORS_DEGRADED ||
    sensor.orphan_events > ORPHAN_DEGRADED
  ) {
    return SENSOR_HEALTH.DEGRADED
  }
  return SENSOR_HEALTH.HEALTHY
}

function orphanEventList(alerts) {
  return alerts
    .filter((alert) => !alert.src_ip)
    .slice(0, ORPHAN_EVENT_LIMIT)
    .map((alert) => ({
      id: alert.id,
      ts: alert.ts,
      protocol: alert.protocol ?? 'unknown',
      signature: alert.suricata?.signature ?? 'decode error',
      signature_id: alert.suricata?.signature_id ?? null,
      reason: alert.reasons?.[0] ?? 'no IP tuple',
    }))
}

/**
 * List sensors with health metrics.
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 */
export async function listSensors() {
  await delay()
  const alerts = getAlerts()
  const now = Date.now()
  const orphans = orphanEventList(alerts)
  const orphanCount = alerts.filter((a) => !a.src_ip).length
  const newest = alerts.reduce(
    (latest, a) => (new Date(a.ts) > new Date(latest) ? a.ts : latest),
    new Date(0).toISOString(),
  )
  const recent = alerts.filter((a) => now - new Date(a.ts).getTime() <= WINDOW_MS).length

  const data = getState().sensors.map((sensor) => {
    const primary = sensor.role === 'primary'
    const enriched = {
      ...sensor,
      last_seen: primary ? newest : sensor.last_seen,
      orphan_events: primary ? orphanCount : sensor.orphan_events,
      events_per_min: primary ? recent || sensor.events_per_min : sensor.events_per_min,
      orphan_event_list: primary ? orphans : [],
    }
    return { ...enriched, health: healthFor(enriched, now) }
  })

  return { data, meta: { total: data.length } }
}

/**
 * Get a single sensor by id.
 * @param {string} id Sensor id.
 * @returns {Promise<object|null>}
 */
export async function getSensor(id) {
  const { data } = await listSensors()
  return data.find((sensor) => sensor.id === id) ?? null
}
