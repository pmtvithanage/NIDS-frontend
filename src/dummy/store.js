/**
 * Shared in-memory store for the dummy data layer.
 *
 * Every dummy module reads and mutates state through this module so the whole
 * console stays consistent (stats, incidents, hosts, streams, ...) until the
 * page is reloaded. No React imports here.
 * @module dummy/store
 */

import { generateAlerts } from './alerts.dummy.js'

/** @type {object|null} */
let state = null

/** Listeners notified whenever a new alert is ingested via {@link pushAlert}. */
const ingestListeners = new Set()

/** Seed metadata for the fleet. Metrics are refined live in sensors.dummy. */
const SENSOR_SEEDS = [
  { id: 'charitha', name: 'charitha (primary)', role: 'primary', location: 'Colombo DC-1', version: 'Suricata 7.0.7' },
  { id: 'ruhuna', name: 'ruhuna (edge)', role: 'edge', location: 'Matara edge', version: 'Suricata 7.0.6' },
  { id: 'kelaniya', name: 'kelaniya (edge)', role: 'edge', location: 'Kelaniya edge', version: 'Suricata 7.0.5' },
]

function buildSensors() {
  const now = Date.now()
  return SENSOR_SEEDS.map((seed, index) => ({
    ...seed,
    status: index === 2 ? 'offline' : 'online',
    last_seen: new Date(now - index * 4000).toISOString(),
    events_per_min: 1820 - index * 300,
    kafka_lag: 12 + index * 8,
    ingest_errors: 3 + index * 5,
    orphan_events: 7 + index,
  }))
}

function buildSuppressions() {
  const now = Date.now()
  return [
    {
      id: 'sup_seed_1',
      name: 'Ignore IPv4 invalid checksum (lab)',
      reason: 'Known NIC offload artifact on the lab VLAN.',
      enabled: true,
      match: { signature_id: 2200073 },
      created_by: 'admin@nids.local',
      created_at: new Date(now - 86_400_000 * 3).toISOString(),
      hit_count: 0,
    },
    {
      id: 'sup_seed_2',
      name: 'Ignore truncated IPv6 packets',
      reason: 'MTU mismatch on the uplink, non-malicious.',
      enabled: true,
      match: { q: 'truncated packet' },
      created_by: 'analyst@nids.local',
      created_at: new Date(now - 86_400_000).toISOString(),
      hit_count: 0,
    },
  ]
}

function buildUsers() {
  return [
    { email: 'admin@nids.local', name: 'Admin', role: 'admin', password: 'admin' },
    {
      email: 'analyst@nids.local',
      name: 'Analyst',
      role: 'analyst',
      password: 'analyst',
    },
    { email: 'viewer@nids.local', name: 'Viewer', role: 'viewer', password: 'viewer' },
  ]
}

/**
 * Lazily build and return the singleton in-memory state.
 * @returns {{ alerts: object[], suppressions: object[], labels: object[],
 *   sensors: object[], users: object[] }} The shared state.
 */
export function getState() {
  if (!state) {
    state = {
      alerts: generateAlerts(),
      suppressions: buildSuppressions(),
      labels: [],
      sensors: buildSensors(),
      users: buildUsers(),
    }
  }
  return state
}

/**
 * Return the live alerts array (mutations persist).
 * @returns {object[]}
 */
export function getAlerts() {
  return getState().alerts
}

/**
 * Find a single alert by id.
 * @param {string} id Alert id.
 * @returns {object|undefined}
 */
export function findAlert(id) {
  return getState().alerts.find((alert) => alert.id === id)
}

/**
 * Apply a partial patch to one alert.
 * @param {string} id Alert id.
 * @param {object} patch Fields to merge.
 * @returns {object|undefined} Updated alert.
 */
export function patchAlert(id, patch) {
  const alert = findAlert(id)
  if (!alert) return undefined
  Object.assign(alert, patch, { updated_at: new Date().toISOString() })
  return alert
}

/**
 * Apply a patch to many alerts.
 * @param {string[]} ids Alert ids.
 * @param {object} patch Fields to merge.
 * @returns {number} Number of alerts updated.
 */
export function patchAlerts(ids, patch) {
  let count = 0
  for (const id of ids) {
    if (patchAlert(id, patch)) count += 1
  }
  return count
}

/**
 * Prepend a newly ingested alert to the store.
 * @param {object} alert Alert object.
 * @returns {object} The inserted alert.
 */
export function pushAlert(alert) {
  getState().alerts.unshift(alert)
  for (const listener of ingestListeners) listener(alert)
  return alert
}

/**
 * Subscribe to ingested alerts (e.g. the metrics feed counts them per second).
 * @param {(alert: object) => void} listener Called for every pushed alert.
 * @returns {() => void} Unsubscribe function.
 */
export function onAlertIngested(listener) {
  ingestListeners.add(listener)
  return () => ingestListeners.delete(listener)
}

/**
 * Record a submitted label.
 * @param {object} entry Label entry.
 * @returns {object} The stored entry.
 */
export function addLabel(entry) {
  getState().labels.push(entry)
  return entry
}

/**
 * Remove the most recent label for an alert (undo).
 * @param {string} alertId Alert id.
 * @returns {object|undefined} The removed label entry, if any.
 */
export function removeLabel(alertId) {
  const list = getState().labels
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].alert_id === alertId) {
      const [removed] = list.splice(i, 1)
      return removed
    }
  }
  return undefined
}

/**
 * Add a suppression rule.
 * @param {object} rule Rule object.
 * @returns {object} The stored rule.
 */
export function addSuppression(rule) {
  getState().suppressions.unshift(rule)
  return rule
}

/**
 * Merge a partial patch into a suppression rule.
 * @param {string} id Rule id.
 * @param {object} patch Fields to merge.
 * @returns {object|undefined} Updated rule.
 */
export function updateSuppression(id, patch) {
  const rule = getState().suppressions.find((item) => item.id === id)
  if (!rule) return undefined
  Object.assign(rule, patch, { updated_at: new Date().toISOString() })
  return rule
}

/**
 * Remove a suppression rule by id.
 * @param {string} id Rule id.
 * @returns {boolean} True when a rule was removed.
 */
export function removeSuppression(id) {
  const list = getState().suppressions
  const index = list.findIndex((rule) => rule.id === id)
  if (index === -1) return false
  list.splice(index, 1)
  return true
}
