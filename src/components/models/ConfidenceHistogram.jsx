import { memo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="text-text">confidence {point.bin}</p>
      <p className="tabular-nums text-muted">{point.count} alerts</p>
    </div>
  )
}

/**
 * Histogram of MLP confidence scores.
 * @param {{bins?: Array<{bin: string, count: number}>}} props
 */
function ConfidenceHistogram({ bins = [] }) {
  if (bins.length === 0) {
    return <EmptyState title="No confidence data" description="No MLP confidence scores were produced." />
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis dataKey="bin" stroke="var(--muted)" fontSize={10} tickLine={false} interval={0} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="count" fill="var(--accent)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(ConfidenceHistogram)
