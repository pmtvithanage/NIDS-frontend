import { memo } from 'react'
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="text-text">AE error {point.label}</p>
      <p className="tabular-nums text-muted">{point.count} alerts</p>
    </div>
  )
}

function thresholdBinLabel(bins, threshold) {
  const bin = bins.find((entry) => threshold >= entry.range[0] && threshold < entry.range[1])
  return bin?.label ?? null
}

/**
 * Histogram of autoencoder reconstruction error with the anomaly threshold.
 * @param {{bins?: Array<{range: number[], label: string, count: number, over_threshold: boolean}>, threshold?: number}} props
 */
function AEHistogram({ bins = [], threshold = 0 }) {
  if (bins.length === 0) {
    return <EmptyState title="No error data" description="No reconstruction errors were produced." />
  }

  const marker = thresholdBinLabel(bins, threshold)

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis dataKey="label" stroke="var(--muted)" fontSize={10} tickLine={false} interval={0} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--surface-2)' }} />
          {marker ? (
            <ReferenceLine x={marker} stroke="var(--sev-critical)" strokeDasharray="4 3" label={{ value: 'threshold', fill: 'var(--sev-critical)', fontSize: 10, position: 'top' }} />
          ) : null}
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {bins.map((entry) => (
              <Cell key={entry.label} fill={entry.over_threshold ? 'var(--sev-critical)' : 'var(--accent)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(AEHistogram)
