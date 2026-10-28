import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import ChartCard from '../common/ChartCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useTimeseries } from '../../hooks/useStats.js'
import {
  OVERVIEW_CHART_HEIGHT,
  OVERVIEW_CHART_INTERVALS,
  OVERVIEW_DEFAULT_INTERVAL,
  OVERVIEW_INTERVAL_MS,
  OVERVIEW_SEVERITY_COLOR,
} from '../../constants/overview.js'
import { SEVERITY_LABEL, SEVERITY_ORDER } from '../../constants/severity.js'
import { DEFAULT_TIMEZONE } from '../../utils/format.js'
import { buildAlertsHref } from '../../utils/overview.js'

const tickHour = new Intl.DateTimeFormat('en-GB', {
  timeZone: DEFAULT_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const tickDay = new Intl.DateTimeFormat('en-GB', {
  timeZone: DEFAULT_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
})

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((entry) => entry.value)
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="mb-1 font-medium text-text">{tickDay.format(new Date(payload[0].payload.ts))}</p>
      {rows.length === 0 ? (
        <p className="text-muted">No alerts</p>
      ) : (
        rows.map((entry) => (
          <p key={entry.dataKey} className="tabular-nums text-muted">
            {SEVERITY_LABEL[entry.dataKey] ?? entry.dataKey}: {entry.value}
          </p>
        ))
      )}
      <p className="mt-1 text-[10px] text-muted">Click a bar to open alerts</p>
    </div>
  )
}

/**
 * Stacked alert counts per severity tier over the active window, with a
 * bucket-size switch. Clicking a bar deep-links to the matching alerts.
 * @param {{from?: string|null, to?: string|null}} props Active time window.
 */
function AlertsOverTimeChart({ from, to }) {
  const [interval, setInterval] = useState(OVERVIEW_DEFAULT_INTERVAL)
  const navigate = useNavigate()
  const query = useTimeseries({ interval, from, to, group_by: 'severity' })

  const rows = (query.data?.points ?? []).map((point) => ({
    ts: point.ts,
    ...Object.fromEntries(SEVERITY_ORDER.map((tier) => [tier, point.groups[tier] ?? 0])),
  }))

  const formatTick = interval === 'day' ? (value) => tickDay.format(new Date(value)) : (value) => tickHour.format(new Date(value))

  const onChartClick = (state) => {
    const start = state?.activeLabel
    if (!start) return
    const end = new Date(new Date(start).getTime() + OVERVIEW_INTERVAL_MS[interval]).toISOString()
    navigate(buildAlertsHref({ range: 'custom', from: start, to: end }))
  }

  const controls = (
    <div className="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label="Bucket size">
      {OVERVIEW_CHART_INTERVALS.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={interval === option.key}
          onClick={() => setInterval(option.key)}
          className={`px-2.5 py-1 text-xs font-medium transition-colors ${
            interval === option.key ? 'bg-accent text-accent-fg' : 'bg-surface text-muted hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  return (
    <ChartCard
      title="Alerts over time"
      description="Alert volume by severity tier across the selected window."
      action={controls}
    >
      {query.isLoading ? <LoadingSkeleton rows={6} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data && rows.length === 0 ? (
        <EmptyState title="No alerts in range" description="Try widening the time range." />
      ) : null}
      {query.data && rows.length > 0 ? (
        <div style={{ height: OVERVIEW_CHART_HEIGHT }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              onClick={onChartClick}
              accessibilityLayer
              margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="ts"
                tickFormatter={formatTick}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis allowDecimals={false} stroke="var(--muted)" fontSize={11} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<TooltipContent />} />
              <Legend formatter={(value) => SEVERITY_LABEL[value] ?? value} />
              {SEVERITY_ORDER.map((tier) => (
                <Bar key={tier} dataKey={tier} stackId="alerts" fill={OVERVIEW_SEVERITY_COLOR[tier]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </ChartCard>
  )
}

export default AlertsOverTimeChart

























