import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import ChartCard from '../common/ChartCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useSummary } from '../../hooks/useStats.js'
import { OVERVIEW_CHART_HEIGHT, OVERVIEW_SEVERITY_COLOR } from '../../constants/overview.js'
import { SEVERITY_LABEL, SEVERITY_ORDER } from '../../constants/severity.js'

const DOT_CLASS = {
  LOW: 'bg-sev-low',
  MEDIUM: 'bg-sev-medium',
  HIGH: 'bg-sev-high',
  CRITICAL: 'bg-sev-critical',
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="font-medium text-text">{point.name}</p>
      <p className="tabular-nums text-muted">{point.value} alerts</p>
    </div>
  )
}

/**
 * Severity-tier donut for the active window, with the total in the middle and
 * a text legend (severity is never conveyed by color alone).
 * @param {{from?: string|null, to?: string|null}} props Active time window.
 */
function SeverityDonut({ from, to }) {
  const query = useSummary({ from, to })
  const bySeverity = query.data?.by_severity
  const total = bySeverity
    ? SEVERITY_ORDER.reduce((sum, tier) => sum + (bySeverity[tier] ?? 0), 0)
    : 0
  const data = bySeverity
    ? SEVERITY_ORDER.map((tier) => ({
        tier,
        name: SEVERITY_LABEL[tier],
        value: bySeverity[tier] ?? 0,
      })).filter((entry) => entry.value > 0)
    : []

  return (
    <ChartCard title="Severity mix" description="Share of alerts per tier.">
      {query.isLoading ? <LoadingSkeleton rows={6} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data && total === 0 ? (
        <EmptyState title="No alerts in range" description="Nothing to break down yet." />
      ) : null}
      {query.data && total > 0 ? (
        <div className="relative" style={{ height: OVERVIEW_CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="var(--surface)"
              >
                {data.map((entry) => (
                  <Cell key={entry.tier} fill={OVERVIEW_SEVERITY_COLOR[entry.tier]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums text-text">{total}</span>
            <span className="text-xs text-muted">alerts</span>
          </div>
        </div>
      ) : null}
      {query.data && total > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
          {SEVERITY_ORDER.map((tier) => {
            const value = bySeverity[tier] ?? 0
            const share = total ? Math.round((value / total) * 100) : 0
            return (
              <li key={tier} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-text">
                  <span className={`h-2 w-2 rounded-full ${DOT_CLASS[tier] ?? 'bg-muted'}`} aria-hidden="true" />
                  {SEVERITY_LABEL[tier]}
                </span>
                <span className="tabular-nums text-muted">
                  {value} · {share}%
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </ChartCard>
  )
}

export default SeverityDonut





















