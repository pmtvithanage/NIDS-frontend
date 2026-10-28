/**
 * Shared dygraphs wrapper for real-time / streaming time-series charts.
 *
 * The Dygraph instance is created exactly once per mount and updated through
 * `updateOptions`, never re-created (see AGENTS.md §9). Streaming rows live in a
 * ring buffer outside React state and the canvas is refreshed at most once per
 * second, so React does not re-render per message. The legend and the accessible
 * latest-values summary are refreshed imperatively on the same throttle.
 * @module components/charts/DygraphChart
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import Dygraph from 'dygraphs'
import 'dygraphs/dist/dygraph.css'

import {
  DYGRAPH_DEFAULT_HEIGHT,
  DYGRAPH_DEFAULT_MAX_POINTS,
  DYGRAPH_FALLBACK_COLOR,
} from '../../constants/charts.js'
import {
  drawBands,
  drawThresholdLines,
  formatChartValue,
  trimRows,
} from '../../utils/dygraph.js'
import DygraphLegend from './DygraphLegend.jsx'
import { useDygraphStream } from './useDygraphStream.js'
import { useDygraphTheme } from './useDygraphTheme.js'

/** Stable defaults to avoid effect churn. */
const EMPTY_ROWS = []
const EMPTY_LIST = []
const EMPTY_OPTIONS = {}

/**
 * @param {{
 *   data?: Array<Array<Date|number>>,
 *   labels: string[],
 *   colors?: string[],
 *   options?: object,
 *   bands?: Array<{from: number, to?: number, color?: string, opacity?: number, axis?: number}>,
 *   thresholdLines?: Array<{value: number, color?: string, label?: string}>,
 *   maxPoints?: number,
 *   height?: number,
 *   formatValue?: (value: unknown, seriesName?: string) => string,
 *   onPointClick?: (row: Array<Date|number>|undefined, annotation: object) => void,
 *   onZoomChange?: (zoomed: boolean) => void,
 *   onHighlight?: (ts: Date|null) => void,
 *   onZoom?: (range: [Date, Date]|null) => void,
 *   annotations?: object[],
 *   ariaLabel?: string,
 * }} props
 */
const DygraphChart = forwardRef(function DygraphChart(
  {
    data = EMPTY_ROWS,
    labels,
    colors,
    options = EMPTY_OPTIONS,
    bands = EMPTY_LIST,
    thresholdLines = EMPTY_LIST,
    maxPoints = DYGRAPH_DEFAULT_MAX_POINTS,
    height = DYGRAPH_DEFAULT_HEIGHT,
    formatValue = formatChartValue,
    onPointClick,
    onZoomChange,
    onHighlight,
    onZoom,
    annotations = EMPTY_LIST,
    ariaLabel = 'Live time-series chart',
  },
  ref,
) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const legendRef = useRef(null)
  const summaryRef = useRef(null)
  const formatValueRef = useRef(formatValue)
  const pointClickRef = useRef(onPointClick)
  const zoomChangeRef = useRef(onZoomChange)
  const highlightRef = useRef(onHighlight)
  const zoomRangeRef = useRef(onZoom)
  const overlayRef = useRef({ thresholdLines, bands })

  const [initialRows] = useState(() => trimRows(data, maxPoints))
  const [zoomed, setZoomed] = useState(false)
  const [hidden, setHidden] = useState(() => new Set())

  const palette = useDygraphTheme(colors ?? [])
  const seriesCount = Math.max(labels.length - 1, 0)
  const seriesNames = useMemo(() => labels.slice(1), [labels])

  useEffect(() => {
    formatValueRef.current = formatValue
  }, [formatValue])

  useEffect(() => {
    pointClickRef.current = onPointClick
    zoomChangeRef.current = onZoomChange
    highlightRef.current = onHighlight
    zoomRangeRef.current = onZoom
  }, [onPointClick, onZoomChange, onHighlight, onZoom])

  useEffect(() => {
    overlayRef.current = { thresholdLines, bands }
  }, [thresholdLines, bands])

  const applyValues = useCallback(
    (values) => {
      const texts = seriesNames.map((name, index) => formatValueRef.current(values?.[index], name))
      legendRef.current?.setValues(texts)
      if (summaryRef.current) {
        summaryRef.current.textContent = seriesNames
          .map((name, index) => `${name}: ${texts[index]}`)
          .join(', ')
      }
    },
    [seriesNames],
  )

  /**
   * Dygraph substitutes `[[0]]` when given an empty array, which logs a
   * "Mismatch between number of labels and number of columns" error. Feed it a
   * correctly shaped empty row instead so mounting an empty chart stays quiet.
   */
  const seedRow = useCallback(
    () => (labels.length > 1 ? [new Date(), ...Array(labels.length - 1).fill(null)] : [new Date()]),
    [labels.length],
  )

  const redrawRows = useCallback(
    (rows) => {
      const graph = graphRef.current
      if (!graph) return
      graph.updateOptions({ file: rows.length ? rows : [seedRow()] })
      applyValues(rows[rows.length - 1]?.slice(1))
    },
    [applyValues, seedRow],
  )

  const { bufferRef, replace, append, setData, pause, resume, stop } = useDygraphStream({
    maxPoints,
    redraw: redrawRows,
    initialRows,
  })

  const handleHighlight = useCallback(
    (_event, x, _points, row) => {
      highlightRef.current?.(x ?? null)
      applyValues(bufferRef.current[row]?.slice(1))
    },
    [applyValues, bufferRef],
  )

  const handleUnhighlight = useCallback(() => {
    highlightRef.current?.(null)
    applyValues(bufferRef.current[bufferRef.current.length - 1]?.slice(1))
  }, [applyValues, bufferRef])

  const handleZoom = useCallback((minDate, maxDate) => {
    const isZoomedNow = Boolean(graphRef.current?.isZoomed())
    setZoomed(isZoomedNow)
    zoomChangeRef.current?.(isZoomedNow)
    zoomRangeRef.current?.(isZoomedNow && minDate && maxDate ? [minDate, maxDate] : null)
  }, [])

  const underlay = useCallback((ctx, area, graph) => {
    drawBands(ctx, area, graph, overlayRef.current.bands)
    drawThresholdLines(ctx, area, graph, overlayRef.current.thresholdLines)
  }, [])

  const buildOptions = useCallback(
    () => ({
      labels,
      strokeWidth: 1.5,
      animatedZooms: false,
      axisLabelFontSize: 11,
      axisLabelColor: palette.label,
      gridLineColor: palette.grid,
      axisLineColor: palette.axis,
      backgroundColor: palette.background,
      ...(palette.series.length ? { colors: palette.series } : {}),
      ...options,
      underlayCallback: underlay,
      highlightCallback: handleHighlight,
      unhighlightCallback: handleUnhighlight,
      zoomCallback: handleZoom,
      annotationClickHandler: (annotation) => pointClickRef.current?.(undefined, annotation),
    }),
    [labels, palette, options, underlay, handleHighlight, handleUnhighlight, handleZoom],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const initialFile = bufferRef.current.length ? bufferRef.current : [seedRow()]
    const graph = new Dygraph(container, initialFile, buildOptions())
    graphRef.current = graph
    const observer = new ResizeObserver(() => graph.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      stop()
      graph.destroy()
      graphRef.current = null
    }
    // The Dygraph instance is created exactly once per mount (AGENTS.md §9).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (graphRef.current) graphRef.current.updateOptions(buildOptions())
  }, [buildOptions])

  useEffect(() => {
    if (data !== EMPTY_ROWS) replace(data)
  }, [data, replace])

  useEffect(() => {
    graphRef.current?.setAnnotations(annotations ?? [])
  }, [annotations])

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return
    for (let index = 0; index < seriesCount; index += 1) {
      graph.setVisibility(index, !hidden.has(index))
    }
  }, [hidden, seriesCount])

  const resetZoom = useCallback(() => {
    graphRef.current?.resetZoom()
    setZoomed(false)
  }, [])

  const applyDateWindow = useCallback((from, to) => {
    const graph = graphRef.current
    if (!graph) return
    if (from == null || to == null) graph.updateOptions({ dateWindow: null })
    else graph.updateOptions({ dateWindow: [from, to] })
  }, [])

  const setSelection = useCallback((row) => {
    const graph = graphRef.current
    if (!graph) return
    if (row == null || row < 0) graph.clearSelection()
    else graph.setSelection(row, undefined, undefined, false)
  }, [])

  const getRows = useCallback(() => bufferRef.current, [bufferRef])

  useImperativeHandle(
    ref,
    () => ({
      append,
      setData,
      replace,
      pause,
      resume,
      stop,
      resetZoom,
      applyDateWindow,
      setSelection,
      getRows,
    }),
    [append, setData, replace, pause, resume, stop, resetZoom, applyDateWindow, setSelection, getRows],
  )

  const toggleSeries = useCallback((index) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const colorList = palette.series.length ? palette.series : [DYGRAPH_FALLBACK_COLOR]
  const seriesColors = seriesNames.map((_, index) => colorList[index % colorList.length])
  const series = seriesNames.map((name, index) => ({
    name,
    color: seriesColors[index],
    visible: !hidden.has(index),
  }))

  return (
    <div className="w-full">
      <DygraphLegend
        ref={legendRef}
        info={{ series, zoomed }}
        onToggle={toggleSeries}
      />
      <div
        ref={containerRef}
        role="img"
        aria-label={ariaLabel}
        style={{ height }}
        className="w-full"
      />
      <span ref={summaryRef} className="sr-only" aria-live="off" />
    </div>
  )
})

export default DygraphChart

























