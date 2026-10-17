import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DygraphChart from '../../charts/DygraphChart.jsx'
import { SEVERITY, SEVERITY_LABEL } from '../../../constants/severity.js'
import { useAlertStream } from '../../../hooks/useAlertStream.js'
import { useLiveChart } from '../../../hooks/useLiveChart.js'
import { formatChartValue, resolveCssVar } from '../../../utils/dygraph.js'

const DISPLAY_ORDER = [SEVERITY.CRITICAL, SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW]
const LABELS = ['t', ...DISPLAY_ORDER.map((tier) => SEVERITY_LABEL[tier])]
const ANNOTATION_SERIES = SEVERITY_LABEL[SEVERITY.CRITICAL]
const ANNOTATION_LIMIT = 30
const SEVERITY_COLOR = {
  [SEVERITY.CRITICAL]: '--sev-critical',
  [SEVERITY.HIGH]: '--sev-high',
  [SEVERITY.MEDIUM]: '--sev-medium',
  [SEVERITY.LOW]: '--sev-low',
}
const SERIES_COLORS = DISPLAY_ORDER.map((tier) => SEVERITY_COLOR[tier])
const FORMAT_OPTIONS = {
  stackedGraph: true,
  fillGraph: true,
  fillAlpha: 0.25,
  drawGrid: true,
  axisLabelFormatter: (value) => value.toLocaleString(),
}

function AlertRateChart({ id, feed, paused }) {
  const navigate = useNavigate()
  const [annotations, setAnnotations] = useState([])

  const toRow = useCallback(
    (point) => [new Date(point.ts), ...DISPLAY_ORDER.map((tier) => point.alerts[tier.toLowerCase()] ?? 0)],
    [],
  )

  const { chartRef, onHighlight, onZoom } = useLiveChart({ id, feed, toRow, paused })

  useAlertStream(
    (alert) => {
      if (alert.severity_tier !== SEVERITY.CRITICAL) return
      setAnnotations((prev) => {
        if (prev.some((entry) => entry.id === alert.id)) return prev
        const next = prev.concat({
          id: alert.id,
          series: ANNOTATION_SERIES,
          x: new Date(alert.ts),
          shortText: '!',
          text: `${alert.suricata?.signature ?? 'Critical alert'} — ${alert.src_ip ?? 'unknown'}`,
          color: resolveCssVar('--sev-critical'),
        })
        return next.slice(-ANNOTATION_LIMIT)
      })
    },
    { minSeverity: SEVERITY.CRITICAL },
  )

  const handleAnnotationClick = useCallback(
    (_row, annotation) => {
      if (annotation?.id) navigate(`/alerts/${annotation.id}`)
    },
    [navigate],
  )

  return (
    <DygraphChart
      ref={chartRef}
      labels={LABELS}
      colors={SERIES_COLORS}
      options={FORMAT_OPTIONS}
      annotations={annotations}
      onPointClick={handleAnnotationClick}
      onHighlight={onHighlight}
      onZoom={onZoom}
      formatValue={formatChartValue}
      ariaLabel="Alert rate per second stacked by severity"
    />
  )
}

export default memo(AlertRateChart)

