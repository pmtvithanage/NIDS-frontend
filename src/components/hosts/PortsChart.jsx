import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import EmptyState from '../common/EmptyState.jsx'
import { HOST_PORT_LIMIT } from '../../constants/hosts.js'

const BAR_COLOR = 'var(--accent)'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="font-medium text-text">port {point.port}</p>
      <p className="tabular-nums text-muted">{point.count} alerts</p>
    </div>
  )
}

/**
 * Bar chart of the ports most frequently contacted by the host.
 * @param {{ports?: Array<{key: string, count: number}>}} props
 */
function PortsChart({ ports = [] }) {
  const data = ports.slice(0, HOST_PORT_LIMIT).map((entry) => ({ port: entry.key, count: entry.count }))

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Ports contacted</h2>
      {data.length === 0 ? (
        <EmptyState title="No destination ports" description="This host has no outbound port activity." />
      ) : (
        <div className="mt-2 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <XAxis type="number" stroke="var(--muted)" fontSize={11} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="port"
                width={56}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 3, 3, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.port} fill={BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default PortsChart
