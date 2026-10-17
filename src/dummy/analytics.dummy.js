/**
 * Dummy analytics resource. All figures derive from the shared in-memory
 * alerts (and the deterministic feature vectors) so charts match the rest of
 * the console.
 * @module dummy/analytics.dummy
 */

import { COUNTRY_POOL, INTERNAL_COUNTRY, SCATTER_LIMIT } from '../constants/analytics.js'
import { FLOW_NULL_SENTINEL } from '../constants/alerts.js'
import { delay, hashString } from './helpers.js'
import { FEATURE_COLUMNS, buildAlertFeatureVector } from './alertDetail.dummy.js'
import { getAlerts } from './store.js'
import { isInternalIp } from './hosts.dummy.js'
import { DEFAULT_TIMEZONE } from '../utils/format.js'

const WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

function countBy(list, limit) {
  const counts = new Map()
  for (const key of list) {
    if (key == null) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const sorted = [...counts.entries()]
    .map(([key, count]) => ({ key: String(key), count }))
    .sort((a, b) => b.count - a.count)
  return limit ? sorted.slice(0, limit) : sorted
}

/**
 * Extract the weekday index (Mon=0) and hour (0-23) for an instant in a zone.
 * @param {string} iso ISO UTC timestamp.
 * @param {string} timeZone IANA timezone.
 * @returns {{weekday: number, hour: number}}
 */
function zonedParts(iso, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const weekdayName = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon'
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  return { weekday: WEEKDAY_INDEX[weekdayName] ?? 0, hour }
}

/**
 * Aggregate overview data for the analytics page.
 * @param {{timezone?: string}} [params]
 * @returns {Promise<object>}
 */
export async function getAnalyticsOverview(params = {}) {
  await delay()
  const timezone = params.timezone || DEFAULT_TIMEZONE
  const alerts = getAlerts()

  const heatCells = new Map()
  for (const alert of alerts) {
    const { weekday, hour } = zonedParts(alert.ts, timezone)
    const key = `${weekday}:${hour}`
    heatCells.set(key, (heatCells.get(key) ?? 0) + 1)
  }
  const cells = [...heatCells.entries()].map(([key, count]) => {
    const [weekday, hour] = key.split(':').map(Number)
    return { weekday, hour, count }
  })
  const heatMax = cells.reduce((max, cell) => Math.max(max, cell.count), 0)

  const countryCounts = new Map()
  for (const alert of alerts) {
    if (!alert.dst_ip) continue
    const country = isInternalIp(alert.dst_ip)
      ? INTERNAL_COUNTRY
      : COUNTRY_POOL[hashString(alert.dst_ip) % COUNTRY_POOL.length]
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1)
  }
  const countryTotal = [...countryCounts.values()].reduce((sum, n) => sum + n, 0)
  const countries = [...countryCounts.entries()]
    .map(([country, count]) => ({ country, count, share: countryTotal ? count / countryTotal : 0 }))
    .sort((a, b) => b.count - a.count)

  return {
    total: alerts.length,
    heatmap: {
      cells,
      max: heatMax,
      weekdays: [0, 1, 2, 3, 4, 5, 6],
      hours: Array.from({ length: 24 }, (_, hour) => hour),
    },
    protocols: countBy(alerts.map((alert) => alert.protocol)),
    ports: countBy(alerts.map((alert) => alert.dst_port)),
    top_sources: countBy(alerts.map((alert) => alert.src_ip)),
    top_destinations: countBy(alerts.map((alert) => alert.dst_ip)),
    countries,
    timezone,
    generated_at: new Date().toISOString(),
  }
}

/**
 * List numeric features available to the explorer plus the labels to color by.
 * @returns {Promise<{features: Array<{value: string, label: string}>, labels: string[]}>}
 */
export async function getFeatureCatalog() {
  await delay()
  const labels = [...new Set(getAlerts().map((alert) => alert.mlp_label))]
  return {
    features: FEATURE_COLUMNS.map((column) => ({ value: column, label: column })),
    labels,
  }
}

/**
 * Scatter points for two chosen features, colored by MLP label.
 * @param {{x?: string, y?: string, limit?: number}} [params]
 * @returns {Promise<{x: string, y: string, points: object[]}>}
 */
export async function getFeatureScatter(params = {}) {
  await delay()
  const x = params.x || FEATURE_COLUMNS[1]
  const y = params.y || FEATURE_COLUMNS[14]
  const limit = params.limit ?? SCATTER_LIMIT
  const points = []
  for (const alert of getAlerts()) {
    if (points.length >= limit) break
    const vector = buildAlertFeatureVector(alert)
    const xv = vector[x]
    const yv = vector[y]
    if (xv === FLOW_NULL_SENTINEL || yv === FLOW_NULL_SENTINEL) continue
    if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue
    points.push({ id: alert.id, x: xv, y: yv, label: alert.mlp_label, severity_tier: alert.severity_tier })
  }
  return { x, y, points }
}
