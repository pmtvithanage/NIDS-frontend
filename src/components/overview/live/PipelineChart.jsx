import { memo, useCallback } from 'react'

import DygraphChart from '../../charts/DygraphChart.jsx'
import { MONITOR_COLORS, MONITOR_LAG_THRESHOLD } from '../../../constants/monitoring.js'
import { useLiveChart } from '../../../hooks/useLiveChart.js'

const LABELS = ['t', 'Kafka lag', 'Ingest errors']
const COLORS = [MONITOR_COLORS.lag, MONITOR_COLORS.errors]
const ERROR_SERIES = 'Ingest errors'
const BANDS = [{ from: MONITOR_LAG_THRESHOLD, color: '--sev-critical', opacity: 0.08 }]
const THRESHOLD_LINES = [{ value: MONITOR_LAG_THRESHOLD, color: '--sev-critical', label: 'lag limit' }]

const OPTIONS = {
  drawGrid: true,
  fillGraph: true,
  fillAlpha: 0.15,
  series: { [ERROR_SERIES]: { axis: 'y2', fillGraph: false, strokeWidth: 1 } },
  axes: {
    y: { axisLabelFormatter: (value) => (Number.isFinite(value) ? value.toFixed(0) : '') },
    y2: { independentTicks: true, axisLabelFormatter: (value) => (Number.isFinite(value) ? value.toFixed(0) : '') },
  },
}

function formatValue(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(0)
}

function PipelineChart({ id, feed, paused }) {
  const toRow = useCallback(
    (point) => [new Date(point.ts), point.kafka_lag, point.ingest_errors],
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
      formatValue={formatValue}
      ariaLabel="Ingest pipeline: Kafka consumer lag and ingest errors"
    />
  )
}

export default memo(PipelineChart)
