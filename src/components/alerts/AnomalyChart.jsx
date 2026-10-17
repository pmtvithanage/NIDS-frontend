import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'

const POSITIVE_COLOR = 'var(--sev-critical)'
const NEGATIVE_COLOR = 'var(--accent)'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="font-medium text-text">{point.feature}</p>
      <p className="tabular-nums text-muted">z = {point.z_score}</p>
      <p className="tabular-nums text-muted">value = {point.value}</p>
    </div>
  )
}

/**
 * Horizontal bar chart of the top anomalous features (z-scores) behind the flag.
 * @param {{features: Array<{feature: string, value: number, z_score: number}>}} props
 */
function AnomalyChart({ features = [] }) {
  if (features.length === 0) {
    return <EmptyState title="No explainability data" description="Feature attribution is unavailable." />
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={features} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" stroke="var(--muted)" fontSize={11} tickLine={false} />
          <YAxis
            type="category"
            dataKey="feature"
            width={160}
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
          />
          <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="z_score" radius={[0, 3, 3, 0]}>
            {features.map((entry) => (
              <Cell
                key={entry.feature}
                fill={entry.z_score >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AnomalyChart
