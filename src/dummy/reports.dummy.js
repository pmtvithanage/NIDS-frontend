/**
 * Dummy reports resource.
 * @module dummy/reports.dummy
 */

import { getAlerts } from './store.js'
import { delay } from './helpers.js'
import { LABELS } from '../constants/labels.js'
import { SEVERITY_ORDER, SEVERITY_RANK } from '../constants/severity.js'
import { REPORT_ATTACK_SEVERITIES, REPORT_TOP_LIMIT } from '../constants/reports.js'

function dateKey(iso) {
  return new Date(iso).toISOString().slice(0, 10)
}

function topBy(alerts, selector, limit = 5) {
  const counts = new Map()
  for (const alert of alerts) {
    const key = selector(alert)
    if (key == null) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/** Top attacking sources: severity-weighted counts, worst tier first. */
function topAttackers(alerts, limit) {
  const attackers = new Map()
  for (const alert of alerts) {
    if (!REPORT_ATTACK_SEVERITIES.includes(alert.severity_tier)) continue
    const entry = attackers.get(alert.src_ip) ?? { ip: alert.src_ip, count: 0, severity_tier: alert.severity_tier }
    entry.count += 1
    if (SEVERITY_RANK[alert.severity_tier] > SEVERITY_RANK[entry.severity_tier]) {
      entry.severity_tier = alert.severity_tier
    }
    attackers.set(alert.src_ip, entry)
  }
  return [...attackers.values()]
    .sort((a, b) => SEVERITY_RANK[b.severity_tier] - SEVERITY_RANK[a.severity_tier] || b.count - a.count)
    .slice(0, limit)
}

/**
 * Build a daily report for a given UTC date.
 * @param {string} date Date as YYYY-MM-DD (defaults to today).
 * @returns {Promise<object>}
 */
export async function getDailyReport(date) {
  await delay()
  const target = date || new Date().toISOString().slice(0, 10)
  const alerts = getAlerts().filter((a) => dateKey(a.ts) === target)
  const by_severity = Object.fromEntries(SEVERITY_ORDER.map((t) => [t, 0]))
  const labelCounts = Object.fromEntries(LABELS.map((label) => [label, 0]))
  const incidents = new Set()
  let noise = 0
  let benign = 0
  for (const a of alerts) {
    by_severity[a.severity_tier] += 1
    if (labelCounts[a.mlp_label] === undefined) labelCounts[a.mlp_label] = 0
    labelCounts[a.mlp_label] += 1
    if (a.incident_id) incidents.add(a.incident_id)
    if (a.likely_benign) noise += 1
    if (a.mlp_label === 'BENIGN') benign += 1
  }
  return {
    date: target,
    totals: {
      alerts: alerts.length,
      incidents: incidents.size,
      benign,
      malicious: alerts.length - benign,
      noise_ratio: alerts.length ? Math.round((noise / alerts.length) * 1000) / 1000 : 0,
    },
    by_severity,
    label_counts: labelCounts,
    top_signatures: topBy(alerts, (a) => a.suricata.signature),
    top_sources: topBy(alerts, (a) => a.src_ip),
    top_destinations: topBy(alerts, (a) => a.dst_ip),
    top_attackers: topAttackers(alerts, REPORT_TOP_LIMIT),
    incidents: [...incidents],
    generated_at: new Date().toISOString(),
  }
}
