/**
 * Dummy incidents resource. Incidents are derived from alerts that share an
 * `incident_id`, so they always stay consistent with the alerts list.
 * @module dummy/incidents.dummy
 */

import { getAlerts } from './store.js'
import { delay } from './helpers.js'
import { isInternalIp } from './hosts.dummy.js'
import { SEVERITY_ORDER } from '../constants/severity.js'

const INCIDENT_STATUS_PRIORITY = ['closed', 'resolved', 'confirmed', 'triaging', 'open']

function maxSeverity(alerts) {
  return alerts.reduce(
    (worst, a) =>
      SEVERITY_ORDER.indexOf(a.severity_tier) > SEVERITY_ORDER.indexOf(worst)
        ? a.severity_tier
        : worst,
    'LOW',
  )
}

function deriveStatus(alerts) {
  const statuses = new Set(alerts.map((a) => a.status))
  for (const status of INCIDENT_STATUS_PRIORITY) {
    if (statuses.has(status)) return status
  }
  return 'open'
}

function buildIncident(id, alerts) {
  const sorted = alerts.slice().sort((a, b) => new Date(a.ts) - new Date(b.ts))
  const primary = sorted[0]
  const labels = [...new Set(sorted.map((a) => a.mlp_label))]
  return {
    id,
    title: `${primary.mlp_label} — ${primary.suricata.signature}`,
    severity_tier: maxSeverity(sorted),
    status: deriveStatus(sorted),
    alert_count: sorted.length,
    first_seen: sorted[0].ts,
    last_seen: sorted[sorted.length - 1].ts,
    assignee: sorted.map((a) => a.assignee).find(Boolean) ?? null,
    primary_src_ip: primary.src_ip,
    primary_dst_ip: primary.dst_ip,
    top_signature: primary.suricata.signature,
    mlp_labels: labels,
    sensor: primary.sensor,
  }
}

function buildHosts(alerts, incident) {
  const map = new Map()
  const touch = (ip, role) => {
    if (!ip) return
    const entry = map.get(ip) ?? { ip, as_source: 0, as_target: 0, alert_count: 0 }
    if (role === 'source') entry.as_source += 1
    if (role === 'target') entry.as_target += 1
    entry.alert_count += 1
    map.set(ip, entry)
  }
  for (const alert of alerts) {
    touch(alert.src_ip, 'source')
    touch(alert.dst_ip, 'target')
  }
  return [...map.values()]
    .map((entry) => ({
      ...entry,
      is_internal: isInternalIp(entry.ip),
      role:
        entry.as_source && entry.as_target
          ? 'both'
          : entry.as_source
            ? 'source'
            : 'target',
      is_primary_src: entry.ip === incident.primary_src_ip,
      is_primary_dst: entry.ip === incident.primary_dst_ip,
    }))
    .sort((a, b) => b.alert_count - a.alert_count)
}

function allIncidents() {
  const groups = new Map()
  for (const alert of getAlerts()) {
    if (!alert.incident_id) continue
    if (!groups.has(alert.incident_id)) groups.set(alert.incident_id, [])
    groups.get(alert.incident_id).push(alert)
  }
  return [...groups.entries()]
    .map(([id, alerts]) => buildIncident(id, alerts))
    .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))
}

/**
 * List incidents.
 * @param {{severity?: string, status?: string}} [params]
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 */
export async function listIncidents(params = {}) {
  await delay()
  let data = allIncidents()
  if (params.severity) data = data.filter((i) => i.severity_tier === params.severity)
  if (params.status) data = data.filter((i) => i.status === params.status)
  return { data, meta: { total: data.length } }
}

/**
 * Get one incident with its alert timeline.
 * @param {string} id Incident id.
 * @returns {Promise<object|null>}
 */
export async function getIncident(id) {
  await delay()
  const alerts = getAlerts().filter((a) => a.incident_id === id)
  if (alerts.length === 0) return null
  const incident = buildIncident(id, alerts)
  const timeline = alerts
    .slice()
    .sort((a, b) => new Date(a.ts) - new Date(b.ts))
    .map((a) => ({
      ts: a.ts,
      type: 'alert',
      alert_id: a.id,
      summary: a.suricata.signature,
      category: a.suricata.category,
      severity_tier: a.severity_tier,
      mlp_label: a.mlp_label,
      status: a.status,
    }))
  return { ...incident, alerts: alerts.map((a) => a.id), hosts: buildHosts(alerts, incident), timeline }
}
