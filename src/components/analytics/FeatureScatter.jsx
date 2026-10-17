import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import EmptyState from '../common/EmptyState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { LABEL_COLORS, LABEL_FALLBACK_COLOR, SCATTER_DOT_RADIUS, SCATTER_FILTER_DEFAULTS } from '../../constants/analytics.js'
import { useFeatureCatalog, useFeatureScatter } from '../../hooks/useAnalytics.js'
import { useUrlState } from '../../hooks/useUrlState.js'

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="font-mono text-text">{point.id}</p>
      <p className="text-muted">{point.label}</p>
      <p className="tabular-nums text-muted">
        x {point.x} · y {point.y}
      </p>
    </div>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * Flow-feature explorer: pick two numeric features and scatter the alerts'
 * feature vectors, colored by MLP label.
 */
function FeatureScatter() {
  const [filters, setFilters] = useUrlState(SCATTER_FILTER_DEFAULTS)
  const catalog = useFeatureCatalog()
  const scatter = useFeatureScatter({ x: filters.x, y: filters.y })

  const features = catalog.data?.features ?? []
  const points = scatter.data?.points ?? []

  const groups = new Map()
  for (const point of points) {
    if (!groups.has(point.label)) groups.set(point.label, [])
    groups.get(point.label).push(point)
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="X axis"
          value={filters.x}
          options={features}
          onChange={(value) => setFilters({ x: value })}
        />
        <Select
          label="Y axis"
          value={filters.y}
          options={features}
          onChange={(value) => setFilters({ y: value })}
        />
      </div>

      {scatter.isLoading || catalog.isLoading ? <LoadingSkeleton rows={5} /> : null}
      {!scatter.isLoading && !catalog.isLoading && points.length === 0 ? (
        <EmptyState title="No points" description="No alerts have both selected features." />
      ) : null}

      {points.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name={filters.x}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={filters.y}
                stroke="var(--muted)"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <ZAxis range={[SCATTER_DOT_RADIUS * 2, SCATTER_DOT_RADIUS * 2]} />
              <Tooltip content={<TooltipContent />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
              {[...groups.entries()].map(([label, labelPoints]) => (
                <Scatter
                  key={label}
                  name={label}
                  data={labelPoints}
                  fill={LABEL_COLORS[label] ?? LABEL_FALLBACK_COLOR}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <p className="text-xs text-muted">
        {points.length} flow vectors · X {filters.x} · Y {filters.y}
      </p>
    </div>
  )
}

export default FeatureScatter
