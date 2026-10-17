import { memo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'
import { ENGINE_COLORS, ENGINE_LABELS, FUSION_ENGINES } from '../../constants/models.js'

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="text-text">{label}</p>
      {payload.map((series) => (
        <p key={series.dataKey} className="tabular-nums text-muted">
          {ENGINE_LABELS[series.dataKey]}: {series.value ?? '—'}
        </p>
      ))}
    </div>
  )
}

/**
 * Per-engine precision or recall over time (by UTC day).
 * @param {{points?: object[], metric?: 'precision'|'recall'}} props
 */
function EnginePrecisionChart({ points = [], metric = 'precision' }) {
  if (points.length === 0) {
    return <EmptyState title="No feedback yet" description="Analyst verdicts are needed to score engines." />
  }

  const data = points.map((point) => ({
    day: point.day,
    ...Object.fromEntries(FUSION_ENGINES.map((engine) => [engine, point.engines[engine]?.[metric] ?? null])),
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 1]} stroke="var(--muted)" fontSize={11} tickLine={false} />
          <Tooltip content={<TooltipContent />} />
          {FUSION_ENGINES.map((engine) => (
            <Line
              key={engine}
              type="monotone"
              dataKey={engine}
              name={ENGINE_LABELS[engine]}
              stroke={ENGINE_COLORS[engine]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(EnginePrecisionChart)
