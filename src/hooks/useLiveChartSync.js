import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { MONITOR_DEFAULT_WINDOW_MS } from '../constants/monitoring.js'
import { findNearestRow } from '../utils/dygraph.js'

/** React context carrying the synchronized live-chart controller. */
export const LiveChartSyncContext = createContext(null)

/**
 * Access the shared crosshair / zoom / window controller.
 * @returns {object}
 */
export function useLiveChartSync() {
  const ctx = useContext(LiveChartSyncContext)
  if (!ctx) throw new Error('useLiveChartSync must be used inside LiveChartSyncContext.Provider')
  return ctx
}

/**
 * Owns the registry of live chart instances and keeps their crosshair, zoom and
 * visible dateWindow in sync. Chart components register an imperative footer
 * ({@link getRows}, setSelection, applyDateWindow, resetZoom) and this hook
 * drives them from `highlightCallback` / `zoomCallback` events, guarding against
 * feedback loops with `syncingRef`.
 *
 * @param {{subscribe: Function, getPoints: Function, isLoading: boolean}} feed
 * @returns {{
 *   register: (id: string, api: object) => () => void,
 *   highlight: (ts: Date|null) => void,
 *   notifyZoom: (range: [Date, Date]|null) => void,
 *   resetZoom: () => void,
 *   setWindowMs: (ms: number) => void,
 *   zoomed: boolean,
 *   windowMs: number,
 * }}
 */
export function useLiveChartSyncProvider(feed) {
  const { subscribe, getPoints, isLoading, paused = false } = feed
  const registryRef = useRef(new Map())
  const syncingRef = useRef(false)
  const zoomedRef = useRef(false)
  const windowMsRef = useRef(MONITOR_DEFAULT_WINDOW_MS)

  const [zoomed, setZoomed] = useState(false)
  const [windowMs, setWindowMsState] = useState(MONITOR_DEFAULT_WINDOW_MS)

  const applyWindow = useCallback((latestMs) => {
    const width = windowMsRef.current
    const from = new Date(latestMs - width)
    const to = new Date(latestMs)
    syncingRef.current = true
    for (const api of registryRef.current.values()) api.applyDateWindow(from, to)
    syncingRef.current = false
  }, [])

  const register = useCallback((id, api) => {
    registryRef.current.set(id, api)
    return () => {
      if (registryRef.current.get(id) === api) registryRef.current.delete(id)
    }
  }, [])

  const highlight = useCallback((ts) => {
    if (syncingRef.current) return
    syncingRef.current = true
    for (const api of registryRef.current.values()) {
      const row = ts == null ? -1 : findNearestRow(api.getRows(), ts)
      api.setSelection(row)
    }
    syncingRef.current = false
  }, [])

  const notifyZoom = useCallback((range) => {
    if (syncingRef.current) return
    if (!range) {
      zoomedRef.current = false
      setZoomed(false)
      return
    }
    zoomedRef.current = true
    setZoomed(true)
    syncingRef.current = true
    for (const api of registryRef.current.values()) api.applyDateWindow(range[0], range[1])
    syncingRef.current = false
  }, [])

  const resetZoom = useCallback(() => {
    zoomedRef.current = false
    setZoomed(false)
    syncingRef.current = true
    for (const api of registryRef.current.values()) api.resetZoom()
    syncingRef.current = false
    const latest = getPoints().at(-1)
    if (latest) applyWindow(new Date(latest.ts).getTime())
  }, [getPoints, applyWindow])

  const setWindowMs = useCallback(
    (next) => {
      windowMsRef.current = next
      setWindowMsState(next)
      zoomedRef.current = false
      setZoomed(false)
      const latest = getPoints().at(-1)
      if (latest) applyWindow(new Date(latest.ts).getTime())
    },
    [getPoints, applyWindow],
  )

  useEffect(() => {
    if (isLoading) return
    const latest = getPoints().at(-1)
    if (latest) applyWindow(new Date(latest.ts).getTime())
  }, [isLoading, getPoints, applyWindow])

  useEffect(
    () =>
      subscribe((point) => {
        if (paused || zoomedRef.current || syncingRef.current) return
        applyWindow(new Date(point.ts).getTime())
      }),
    [subscribe, applyWindow, paused],
  )

  return useMemo(
    () => ({ register, highlight, notifyZoom, resetZoom, setWindowMs, zoomed, windowMs }),
    [register, highlight, notifyZoom, resetZoom, setWindowMs, zoomed, windowMs],
  )
}
