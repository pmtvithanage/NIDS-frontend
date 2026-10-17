import { memo } from 'react'

import {
  HEATMAP_CELL,
  HEATMAP_GAP,
  HEATMAP_HOUR_TICK,
  HEATMAP_HOURS,
  HEATMAP_LEFT,
  HEATMAP_TOP,
  HEATMAP_WEEKDAYS,
} from '../../constants/analytics.js'

const STEP = HEATMAP_CELL + HEATMAP_GAP

function opacityFor(count, max) {
  if (!count || !max) return 0
  return Math.round((0.15 + 0.85 * (count / max)) * 100) / 100
}

/**
 * Hour × weekday alert-density heatmap rendered as an SVG grid.
 * @param {{heatmap: {cells: object[], max: number}}} props
 */
function HeatmapGrid({ heatmap }) {
  const counts = new Map(heatmap.cells.map((cell) => [`${cell.weekday}:${cell.hour}`, cell.count]))
  const width = HEATMAP_LEFT + HEATMAP_HOURS.length * STEP
  const height = HEATMAP_TOP + HEATMAP_WEEKDAYS.length * STEP

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Alert density by weekday and hour"
        className="max-w-full"
      >
        {HEATMAP_HOURS.map((hour) =>
          hour % HEATMAP_HOUR_TICK === 0 ? (
            <text
              key={`hour-${hour}`}
              x={HEATMAP_LEFT + hour * STEP + HEATMAP_CELL / 2}
              y={HEATMAP_TOP - 5}
              textAnchor="middle"
              fontSize={9}
              fill="var(--muted)"
            >
              {hour}
            </text>
          ) : null,
        )}

        {HEATMAP_WEEKDAYS.map((day, row) => (
          <g key={day}>
            <text
              x={HEATMAP_LEFT - 6}
              y={HEATMAP_TOP + row * STEP + HEATMAP_CELL / 2 + 3}
              textAnchor="end"
              fontSize={10}
              fill="var(--muted)"
            >
              {day}
            </text>
            {HEATMAP_HOURS.map((hour) => {
              const count = counts.get(`${row}:${hour}`) ?? 0
              return (
                <rect
                  key={`${row}-${hour}`}
                  x={HEATMAP_LEFT + hour * STEP}
                  y={HEATMAP_TOP + row * STEP}
                  width={HEATMAP_CELL}
                  height={HEATMAP_CELL}
                  rx={2}
                  fill="var(--accent)"
                  fillOpacity={opacityFor(count, heatmap.max)}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                >
                  <title>{`${day} ${String(hour).padStart(2, '0')}:00 — ${count} alerts`}</title>
                </rect>
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default memo(HeatmapGrid)
