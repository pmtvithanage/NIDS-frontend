import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import ChartCard from '../common/ChartCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useEngineAgreement } from '../../hooks/useStats.js'
import { OVERVIEW_CHART_HEIGHT } from '../../constants/overview.js'

const BAR_COLOR = 'var(--accent)'
const AXIS_LABEL_WIDTH = 140

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="font-medium text-text">{point.label}</p>
      <p className="tabular-nums text-muted">{point.count} alerts</p>
    </div>
  )
}

/**
 * Three-engine agreement breakdown as horizontal bars, with a one-line
 * interpretation beneath.
 */
function EngineAgreementChart() {
  const query = useEngineAgreement()
  const rows = query.data?.combos ?? []
  const max = rows.reduce((peak, row) => Math.max(peak, row.count), 0)

  return (
    <ChartCard
      title="Which engines agree"
      description="How often Suricata, the MLP and the autoencoder fire together."
    >
      {query.isLoading ? <LoadingSkeleton rows={5} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data && max === 0 ? (
        <EmptyState title="No detections" description="No engine combinations to compare." />
      ) : null}
      {query.data && max > 0 ? (
        <div style={{ height: OVERVIEW_CHART_HEIGHT }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              accessibilityLayer
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
              <XAxis
                type="number"
                allowDecimals={false}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={AXIS_LABEL_WIDTH}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<TooltipContent />} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {query.data && max > 0 ? (
        <p className="mt-3 text-xs text-muted">
          Strong agreement across all three engines is usually high-confidence; a lone anomaly signal
          is more often noise.
        </p>
      ) : null}
    </ChartCard>
  )
}

export default EngineAgreementChart
