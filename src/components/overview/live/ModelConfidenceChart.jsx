import { memo, useCallback } from 'react'

import DygraphChart from '../../charts/DygraphChart.jsx'
import {
  MONITOR_COLORS,
  MONITOR_CONFIDENCE_HEIGHT,
  MONITOR_MLP_NOISE_CUTOFF,
} from '../../../constants/monitoring.js'
import { useLiveChart } from '../../../hooks/useLiveChart.js'

const LABELS = ['t', 'MLP confidence']
const COLORS = [MONITOR_COLORS.confidence]
const BANDS = [{ from: 0, to: MONITOR_MLP_NOISE_CUTOFF, color: '--sev-medium', opacity: 0.06 }]
const THRESHOLD_LINES = [
  { value: MONITOR_MLP_NOISE_CUTOFF, color: '--sev-medium', label: 'likely-noise cutoff' },
]

const OPTIONS = {
  valueRange: [0, 1],
  drawGrid: true,
  axes: {
    y: { axisLabelFormatter: (value) => (Number.isFinite(value) ? value.toFixed(2) : '') },
  },
}

function formatValue(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(2)
}

function ModelConfidenceChart({ id, feed, paused }) {
  const toRow = useCallback((point) => [new Date(point.ts), point.mlp_conf_avg], [])

  const { chartRef, onHighlight, onZoom } = useLiveChart({ id, feed, toRow, paused })

  return (
    <DygraphChart
      ref={chartRef}
      labels={LABELS}
      colors={COLORS}
      options={OPTIONS}
      height={MONITOR_CONFIDENCE_HEIGHT}
      bands={BANDS}
      thresholdLines={THRESHOLD_LINES}
      onHighlight={onHighlight}
      onZoom={onZoom}
      formatValue={formatValue}
      ariaLabel="Average MLP confidence with likely-noise cutoff"
    />
  )
}

export default memo(ModelConfidenceChart)
