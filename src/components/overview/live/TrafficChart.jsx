import { memo, useCallback } from 'react'

import DygraphChart from '../../charts/DygraphChart.jsx'
import { MONITOR_COLORS } from '../../../constants/monitoring.js'
import { useLiveChart } from '../../../hooks/useLiveChart.js'
import { formatBytes } from '../../../utils/format.js'

const LABELS = ['t', 'Flows/s', 'Bytes/s']
const COLORS = [MONITOR_COLORS.flows, MONITOR_COLORS.bytes]
const BYTES_SERIES = 'Bytes/s'

const OPTIONS = {
  drawGrid: true,
  series: { [BYTES_SERIES]: { axis: 'y2' } },
  axes: {
    y: { axisLabelFormatter: (value) => (Number.isFinite(value) ? value.toFixed(0) : '') },
    y2: {
      axisLabelFormatter: (value) => (Number.isFinite(value) ? formatBytes(value, 0) : ''),
      independentTicks: true,
    },
  },
}

/** Bytes and flows share one legend, so pick the formatter from the series name. */
function formatValue(value, seriesName) {
  if (value === null || value === undefined) return '—'
  if (seriesName === BYTES_SERIES) return formatBytes(value)
  return Number(value).toFixed(1)
}

function TrafficChart({ id, feed, paused }) {
  const toRow = useCallback(
    (point) => [new Date(point.ts), point.flows_per_sec, point.bytes_per_sec],
    [],
  )

  const { chartRef, onHighlight, onZoom } = useLiveChart({ id, feed, toRow, paused })

  return (
    <DygraphChart
      ref={chartRef}
      labels={LABELS}
      colors={COLORS}
      options={OPTIONS}
      onHighlight={onHighlight}
      onZoom={onZoom}
      formatValue={formatValue}
      ariaLabel="Network traffic: flows per second and bytes per second"
    />
  )
}

export default memo(TrafficChart)
