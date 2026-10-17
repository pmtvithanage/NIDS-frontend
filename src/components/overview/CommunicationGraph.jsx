import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, Hash, Network, Table as TableIcon } from 'lucide-react'

import ChartCard from '../common/ChartCard.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import ErrorState from '../common/ErrorState.jsx'
import EmptyState from '../common/EmptyState.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import GraphFlow from './GraphFlow.jsx'
import GraphSidePanel from './GraphSidePanel.jsx'
import { useCommunicationGraph } from '../../hooks/useStats.js'
import { buildAlertsHref } from '../../utils/overview.js'
import { SEVERITY, SEVERITY_RANK } from '../../constants/severity.js'
import { GRAPH_DEFAULT_MINUTES, GRAPH_REFRESH_MS, GRAPH_TABLE_ROWS } from '../../constants/graph.js'

const SEVERITY_CHIPS = [null, SEVERITY.MEDIUM, SEVERITY.HIGH, SEVERITY.CRITICAL]

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        active ? 'border-accent bg-accent text-accent-fg' : 'border-border text-muted hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * "Who is talking to whom" directed communication graph (internal left, external right).
 */
export default function CommunicationGraph() {
  const navigate = useNavigate()
  const [minSeverity, setMinSeverity] = useState(null)
  const [alertsOnly, setAlertsOnly] = useState(false)
  const [asTable, setAsTable] = useState(false)
  const [fitSignal, setFitSignal] = useState(0)
  const [selectedNode, setSelectedNode] = useState(null)
  const { data, isLoading, isError, error, refetch } = useCommunicationGraph({
    minutes: GRAPH_DEFAULT_MINUTES,
  })

  useEffect(() => {
    const id = setInterval(() => refetch(), GRAPH_REFRESH_MS)
    return () => clearInterval(id)
  }, [refetch])

  const nodes = data?.nodes ?? []
  const edges = useMemo(() => {
    if (!minSeverity && !alertsOnly) return data?.edges ?? []
    const min = minSeverity ? SEVERITY_RANK[minSeverity] : -1
    return (data?.edges ?? []).filter(
      (e) => (!minSeverity || SEVERITY_RANK[e.max_severity] >= min) && (!alertsOnly || e.alerts > 0),
    )
  }, [data, minSeverity, alertsOnly])

  const topEdges = useMemo(
    () => [...(data?.edges ?? [])].sort((a, b) => b.alerts - a.alerts).slice(0, GRAPH_TABLE_ROWS),
    [data],
  )

  const onEdgeClick = (edge) => {
    navigate(
      buildAlertsHref({ src_ip: edge.source, dst_ip: edge.target, dst_port: edge.dst_port ?? '' }),
    )
  }

  const actions = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setAsTable((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text hover:bg-surface-2"
      >
        {asTable ? <Network className="h-3.5 w-3.5" aria-hidden="true" /> : <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        {asTable ? 'View as graph' : 'View as table'}
      </button>
      {!asTable ? (
        <button
          type="button"
          onClick={() => setFitSignal((v) => v + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text hover:bg-surface-2"
        >
          <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
          Fit to view
        </button>
      ) : null}
    </div>
  )

  return (
    <ChartCard
      title="Who is talking to whom"
      description={`Directed flows over the last ${GRAPH_DEFAULT_MINUTES} min · internal hosts on the left, external on the right`}
      action={actions}
    >
      {isLoading ? <LoadingSkeleton rows={6} /> : null}
      {isError ? <ErrorState error={error} onRetry={refetch} /> : null}
      {!isLoading && !isError && nodes.length === 0 ? (
        <EmptyState title="No flows" description="No alert traffic in this time window." />
      ) : null}

      {!isLoading && !isError && nodes.length > 0 ? (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {SEVERITY_CHIPS.map((tier) => (
              <Chip key={tier ?? 'all'} active={minSeverity === tier} onClick={() => setMinSeverity(tier)}>
                {tier ? `≥ ${tier}` : 'All'}
              </Chip>
            ))}
            <Chip active={alertsOnly} onClick={() => setAlertsOnly((v) => !v)}>
              Only edges with alerts
            </Chip>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted">
              <Hash className="h-3 w-3" aria-hidden="true" />
              {nodes.length} hosts · {edges.length} flows
            </span>
          </div>

          {data.truncated ? (
            <p className="mb-2 text-[11px] text-muted">
              Showing the top hosts by alert count; other talking pairs are hidden.
            </p>
          ) : null}

          <div className="relative">
            {asTable ? (
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Top communication edges by alert count</caption>
                  <thead className="text-muted">
                    <tr>
                      <th scope="col" className="py-1 pr-2">Source</th>
                      <th scope="col" className="py-1 pr-2">Destination</th>
                      <th scope="col" className="py-1 pr-2">Port</th>
                      <th scope="col" className="py-1 pr-2">Flows</th>
                      <th scope="col" className="py-1">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEdges.map((e) => (
                      <tr key={`${e.source}-${e.target}-${e.dst_port}`} className="border-t border-border">
                        <td className="py-1 pr-2 font-mono text-text">{e.source}</td>
                        <td className="py-1 pr-2 font-mono text-text">{e.target}</td>
                        <td className="py-1 pr-2 text-text">{e.dst_port ?? '-'}</td>
                        <td className="py-1 pr-2 text-text">{e.flows}</td>
                        <td className="py-1">
                          <SeverityBadge tier={e.max_severity} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-96 w-full overflow-hidden rounded-md border border-border">
                <GraphFlow
                  nodes={nodes}
                  edges={edges}
                  fitSignal={fitSignal}
                  onNodeClick={setSelectedNode}
                  onEdgeClick={onEdgeClick}
                />
              </div>
            )}
            <GraphSidePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        </>
      ) : null}
    </ChartCard>
  )
}
