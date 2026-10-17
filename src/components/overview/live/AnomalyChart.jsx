import { memo, useCallback } from 'react'

import DygraphChart from '../../charts/DygraphChart.jsx'
import { MONITOR_AE_EXTREME, MONITOR_COLORS } from '../../../constants/monitoring.js'
import { useLiveChart } from '../../../hooks/useLiveChart.js'

const LABELS = ['t', 'p50', 'p95', 'max']
const COLORS = [MONITOR_COLORS.p50, MONITOR_COLORS.p95, MONITOR_COLORS.max]
const BANDS = [{ from: MONITOR_AE_EXTREME, color: '--sev-critical', opacity: 0.06 }]
const THRESHOLD_LINES = [
  { value: 1, color: '--sev-low', label: 'threshold' },
  { value: MONITOR_AE_EXTREME, color: '--sev-critical', label: 'extreme' },
]

/** Ratio formatter used by the legend, summary and y-axis. */
function formatRatio(value) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(2)}x`
}

const OPTIONS = {
  logscale: true,
  drawGrid: true,
  axes: {
    y: {
      axisLabelFormatter: (value) => (Number.isFinite(value) ? formatRatio(value) : ''),
    },
  },
}

function AnomalyChart({ id, feed, paused }) {
  const toRow = useCallback(
    (point) => [new Date(point.ts), point.ae_ratio_p50, point.ae_ratio_p95, point.ae_ratio_max],
    [],
  )

  const { chartRef, onHighlight, onZoom } = useLiveChart({ id, feed, toRow, paused })

  return (
    <DygraphChart
      ref={chartRef}
      labels={LABELS}
      colors={COLORS}
      options={OPTIONS}
      bands={BANDS}
      thresholdLines={THRESHOLD_LINES}
      onHighlight={onHighlight}
      onZoom={onZoom}
      formatValue={formatRatio}
      ariaLabel="Autoencoder reconstruction ratio (error over threshold)"
    />
  )
}

export default memo(AnomalyChart)
