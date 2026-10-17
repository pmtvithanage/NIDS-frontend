import { memo } from 'react'

import { GRAPH_SEVERITY_CHIP, GRAPH_SEVERITY_CLASS, GRAPH_SEVERITY_VAR } from '../../constants/graph.js'

/**
 * Custom React Flow node for a communication-graph host.
 * Severity is conveyed by a colored ring plus a text chip (never color alone).
 * @param {{data: {ip: string, alertCount: number, maxSeverity: string, country: string, isInternal: boolean}}} props
 */
function GraphNode({ data }) {
  const tier = String(data.maxSeverity || 'LOW').toUpperCase()
  return (
    <div
      title={`${data.ip}${data.country ? ` · ${data.country}` : ''} · ${data.alertCount} alerts`}
      className="w-40 rounded-lg border-2 bg-surface px-2 py-1.5 text-left shadow-sm"
      style={{ borderColor: GRAPH_SEVERITY_VAR[tier] ?? 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-mono text-[11px] font-semibold text-text">{data.ip}</span>
        <span
          className={`shrink-0 text-[9px] font-bold uppercase tracking-wide ${GRAPH_SEVERITY_CLASS[tier] ?? 'text-muted'}`}
        >
          {GRAPH_SEVERITY_CHIP[tier] ?? tier}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[9px] text-muted">
        <span>{data.isInternal ? 'internal' : data.country || 'external'}</span>
        <span>{data.alertCount} alerts</span>
      </div>
    </div>
  )
}

export default memo(GraphNode)
