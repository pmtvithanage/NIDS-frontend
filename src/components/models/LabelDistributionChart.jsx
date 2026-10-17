import { memo } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'
import { LABEL_COLORS, LABEL_FALLBACK_COLOR } from '../../constants/analytics.js'

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
 * MLP predicted-label distribution.
 * @param {{distribution?: Array<{label: string, count: number}>}} props
 */
function LabelDistributionChart({ distribution = [] }) {
  const data = distribution.filter((entry) => entry.count > 0)
  if (data.length === 0) {
    return <EmptyState title="No predictions" description="No MLP labels were produced." />
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis dataKey="label" stroke="var(--muted)" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={56} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={LABEL_COLORS[entry.label] ?? LABEL_FALLBACK_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(LabelDistributionChart)
