import { useCallback, useEffect, useRef } from 'react'

import { useLiveChartSync } from './useLiveChartSync.js'

/**
 * Wire one chart to the shared live metrics feed and the sync controller.
 *
 * The chart's rows are pushed into the {@link module:components/charts/DygraphChart}
 * ring buffer imperatively (`setData` once, then `append` per point) so no series
 * data ever lives in React state. The instance is registered for crosshair/zoom
 * synchronization and paused/resumed with the feed.
 *
 * @param {{
 *   id: string,
 *   feed: {getPoints: Function, subscribe: Function, subscribeReset: Function},
 *   toRow: (point: object) => Array<Date|number|string|null>,
 *   paused: boolean,
 * }} options
 * @returns {{chartRef: object, onHighlight: Function, onZoom: Function}}
 */
export function useLiveChart({ id, feed, toRow, paused }) {
  const { getPoints, subscribe, subscribeReset } = feed
  const { register, highlight, notifyZoom } = useLiveChartSync()
  const chartRef = useRef(null)
  const toRowRef = useRef(toRow)

  useEffect(() => {
    toRowRef.current = toRow
  }, [toRow])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return undefined
    const push = () => chart.setData(getPoints().map((point) => toRowRef.current(point)))
    push()
    const offAppend = subscribe((point) => chart.append([toRowRef.current(point)]))
    const offReset = subscribeReset(push)
    return () => {
      offAppend()
      offReset()
    }
  }, [getPoints, subscribe, subscribeReset])

  useEffect(
    () =>
      register(id, {
        getRows: () => chartRef.current?.getRows() ?? [],
        setSelection: (row) => chartRef.current?.setSelection(row),
        applyDateWindow: (from, to) => chartRef.current?.applyDateWindow(from, to),
        resetZoom: () => chartRef.current?.resetZoom(),
      }),
    [id, register],
  )

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    if (paused) chart.pause()
    else chart.resume()
  }, [paused])

  const onHighlight = useCallback((ts) => highlight(ts), [highlight])
  const onZoom = useCallback((range) => notifyZoom(range), [notifyZoom])

  return { chartRef, onHighlight, onZoom }
}
