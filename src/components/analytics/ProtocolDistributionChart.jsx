import { memo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'

const COLORS = ['var(--accent)', 'var(--sev-medium)', 'var(--sev-high)', 'var(--sev-low)', 'var(--sev-critical)']

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="font-medium text-text">{point.name}</p>
      <p className="tabular-nums text-muted">{point.value} alerts</p>
    </div>
  )
}

/**
 * Protocol distribution of alerts.
 * @param {{protocols?: Array<{key: string, count: number}>}} props
 */
function ProtocolDistributionChart({ protocols = [] }) {
  if (protocols.length === 0) {
    return <EmptyState title="No protocol activity" description="No protocols were observed." />
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={protocols}
            dataKey="count"
            nameKey="key"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
          >
            {protocols.map((entry, index) => (
              <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<TooltipContent />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(ProtocolDistributionChart)
