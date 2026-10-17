/**
 * Dummy communication graph: "who talks to whom" derived from shared alerts.
 * @module dummy/graph.dummy
 */

import { getAlerts } from './store.js'
import { delay } from './helpers.js'
import { hostGeo, isInternalIp } from './hosts.dummy.js'
import { SEVERITY_ORDER } from '../constants/severity.js'
import { GRAPH_DEFAULT_MINUTES, GRAPH_NODE_LIMIT } from '../constants/graph.js'

function maxSeverity(a, b) {
  return SEVERITY_ORDER.indexOf(a) >= SEVERITY_ORDER.indexOf(b) ? a : b
}

export async function getCommunicationGraph(params = {}) {
  await delay()
  const minutes = params.minutes ?? GRAPH_DEFAULT_MINUTES
  const cutoff = Date.now() - minutes * 60_000
  const alerts = getAlerts().filter((a) => {
    const t = new Date(a.ts).getTime()
    if (t < cutoff) return false
    if (!a.src_ip || !a.dst_ip) return false
    return true
  })

  const nodeMap = new Map()
  const edgeKey = (s, d, p) => `${s}::${d}::${p ?? ''}`
  const edgesMap = new Map()

  for (const a of alerts) {
    const s = a.src_ip
    const d = a.dst_ip
    const p = a.dst_port
    const key = edgeKey(s, d, p)
    if (!edgesMap.has(key)) {
      edgesMap.set(key, {
        source: s,
        target: d,
        dst_port: p,
        flows: 0,
        alerts: 0,
        max_severity: a.severity_tier,
      })
    }
    const e = edgesMap.get(key)
    e.flows += 1
    e.alerts += 1
    e.max_severity = maxSeverity(e.max_severity, a.severity_tier)
    if (p != null && e.dst_port == null) e.dst_port = p
  }

  const upsertNode = (ip, severity, alertCount) => {
    const geo = hostGeo(ip)
    const existing = nodeMap.get(ip)
    nodeMap.set(ip, {
      id: ip,
      is_internal: isInternalIp(ip),
      country: geo.country,
      asn: geo.asn,
      alert_count: (existing?.alert_count ?? 0) + alertCount,
      max_severity: maxSeverity(existing?.max_severity ?? 'LOW', severity),
    })
  }

  for (const e of edgesMap.values()) {
    upsertNode(e.source, e.max_severity, e.alerts)
    upsertNode(e.target, e.max_severity, e.alerts)
  }

  let nodes = [...nodeMap.values()]
  nodes.sort((a, b) => b.alert_count - a.alert_count)
  const keep = new Set(nodes.slice(0, GRAPH_NODE_LIMIT).map((n) => n.id))
  nodes = nodes.filter((n) => keep.has(n.id))
  const edges = [...edgesMap.values()].filter((e) => keep.has(e.source) && keep.has(e.target))

  return {
    nodes,
    edges,
    generated_at: new Date().toISOString(),
    truncated: nodeMap.size > GRAPH_NODE_LIMIT,
  }
}
