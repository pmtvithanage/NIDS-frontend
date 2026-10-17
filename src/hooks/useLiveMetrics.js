import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getMetricsHistory, subscribeMetrics } from '../api/metrics.js'
import {
  METRICS_BUFFER_POINTS,
  METRICS_FLUSH_MS,
  METRICS_HISTORY_MINUTES,
  METRICS_STEP_SECONDS,
  METRICS_STREAM_INTERVAL_MS,
} from '../constants/metrics.js'
import { MONITOR_STALE_MS, MONITOR_STATUS, MONITOR_TREND_POINTS } from '../constants/monitoring.js'

const EMPTY_SNAPSHOT = { latest: null, previous: null, pausedCount: 0 }

/**
 * Live metrics feed shared by the real-time monitoring charts.
 *
 * History is fetched once, then `subscribeMetrics` appends points to a
 * ref-backed ring buffer. To keep React out of the per-message path, the
 * "latest" values are published through a ref-backed external store
 * (`subscribeLatest` + `getLatestSnapshot`) consumed with `useSyncExternalStore`
 * and the chart data is appended imperatively via `subscribe`. Only pause,
 * status and error live in React state, so a ticking feed never re-renders the
 * Overview page (AGENTS.md §9).
 *
 * While the tab is hidden the feed auto-suspends; when it becomes visible again
 * the buffer is refilled from `getMetricsHistory` (catch-up) and every chart is
 * reset through `subscribeReset`.
 *
 * @param {{minutes?: number, stepSeconds?: number, intervalMs?: number,
 *   maxPoints?: number}} [options]
 * @returns {{
 *   getPoints: () => object[],
 *   subscribe: (listener: (point: object) => void) => () => void,
 *   subscribeReset: (listener: () => void) => () => void,
 *   subscribeLatest: (listener: () => void) => () => void,
 *   getLatestSnapshot: () => {latest: object|null, previous: object|null, pausedCount: number},
 *   paused: boolean,
 *   status: string,
 *   pause: () => void,
 *   resume: () => void,
 *   togglePause: () => void,
 *   reload: () => void,
 *   isLoading: boolean,
 *   error: Error|null,
 * }}
 */
export function useLiveMetrics(options = {}) {
  const {
    minutes = METRICS_HISTORY_MINUTES,
    stepSeconds = METRICS_STEP_SECONDS,
    intervalMs = METRICS_STREAM_INTERVAL_MS,
    maxPoints = METRICS_BUFFER_POINTS,
  } = options

  const bufferRef = useRef([])
  const listenersRef = useRef(new Set())
  const resetListenersRef = useRef(new Set())
  const latestListenersRef = useRef(new Set())
  const snapshotRef = useRef(EMPTY_SNAPSHOT)
  const latestPointRef = useRef(null)
  const pausedRef = useRef(false)
  const hiddenRef = useRef(false)
  const pausedCountRef = useRef(0)
  const lastFlushRef = useRef(0)
  const lastPointAtRef = useRef(0)
  const loadTokenRef = useRef(0)

  const [paused, setPaused] = useState(false)
  const [stale, setStale] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener)
    return () => listenersRef.current.delete(listener)
  }, [])

  const subscribeReset = useCallback((listener) => {
    resetListenersRef.current.add(listener)
    return () => resetListenersRef.current.delete(listener)
  }, [])

  const subscribeLatest = useCallback((listener) => {
    latestListenersRef.current.add(listener)
    return () => latestListenersRef.current.delete(listener)
  }, [])

  const getLatestSnapshot = useCallback(() => snapshotRef.current, [])

  const getPoints = useCallback(() => bufferRef.current, [])

  const publish = useCallback(() => {
    const buffer = bufferRef.current
    snapshotRef.current = {
      latest: latestPointRef.current,
      previous: buffer[buffer.length - 1 - MONITOR_TREND_POINTS] ?? null,
      pausedCount: pausedCountRef.current,
    }
    for (const listener of latestListenersRef.current) listener()
  }, [])

  const notifyReset = useCallback(() => {
    for (const listener of resetListenersRef.current) listener()
  }, [])

  const handlePoint = useCallback(
    (point) => {
      if (hiddenRef.current) return
      const buffer = bufferRef.current
      buffer.push(point)
      if (buffer.length > maxPoints) buffer.splice(0, buffer.length - maxPoints)
      lastPointAtRef.current = Date.now()
      for (const listener of listenersRef.current) listener(point)
      if (pausedRef.current) {
        pausedCountRef.current += 1
        publish()
        return
      }
      const now = Date.now()
      if (now - lastFlushRef.current < METRICS_FLUSH_MS) return
      lastFlushRef.current = now
      latestPointRef.current = point
      publish()
    },
    [maxPoints, publish],
  )

  const loadHistory = useCallback(async () => {
    const token = loadTokenRef.current + 1
    loadTokenRef.current = token
    const points = await getMetricsHistory({ minutes, stepSeconds })
    if (loadTokenRef.current !== token) return
    bufferRef.current = points.slice(-maxPoints)
    latestPointRef.current = points[points.length - 1] ?? null
    lastPointAtRef.current = Date.now()
    lastFlushRef.current = Date.now()
    publish()
    notifyReset()
  }, [minutes, stepSeconds, maxPoints, publish, notifyReset])

  useEffect(() => {
    let cancelled = false
    loadHistory()
      .then(() => {
        if (!cancelled) setIsLoading(false)
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause)
        setIsLoading(false)
      })
    const unsubscribe = subscribeMetrics(handlePoint, { intervalMs })
    return () => {
      cancelled = true
      loadTokenRef.current += 1
      unsubscribe()
    }
  }, [loadHistory, handlePoint, intervalMs, reloadToken])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenRef.current = true
        return
      }
      if (!hiddenRef.current) return
      hiddenRef.current = false
      if (pausedRef.current) return
      loadHistory().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [loadHistory])

  useEffect(() => {
    const id = window.setInterval(() => {
      const last = lastPointAtRef.current
      setStale(last > 0 && Date.now() - last > MONITOR_STALE_MS)
    }, METRICS_STREAM_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const pause = useCallback(() => {
    pausedRef.current = true
    pausedCountRef.current = 0
    setPaused(true)
    publish()
  }, [publish])

  const resume = useCallback(() => {
    pausedRef.current = false
    pausedCountRef.current = 0
    setPaused(false)
    const buffer = bufferRef.current
    if (buffer.length > 0) {
      latestPointRef.current = buffer[buffer.length - 1]
      lastFlushRef.current = Date.now()
    }
    publish()
  }, [publish])

  const togglePause = useCallback(() => {
    if (pausedRef.current) resume()
    else pause()
  }, [pause, resume])

  const reload = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadToken((token) => token + 1)
  }, [])

  const status = paused
    ? MONITOR_STATUS.PAUSED
    : stale
      ? MONITOR_STATUS.RECONNECTING
      : MONITOR_STATUS.LIVE

  return useMemo(
    () => ({
      getPoints,
      subscribe,
      subscribeReset,
      subscribeLatest,
      getLatestSnapshot,
      paused,
      status,
      pause,
      resume,
      togglePause,
      reload,
      isLoading,
      error,
    }),
    [
      getPoints,
      subscribe,
      subscribeReset,
      subscribeLatest,
      getLatestSnapshot,
      paused,
      status,
      pause,
      resume,
      togglePause,
      reload,
      isLoading,
      error,
    ],
  )
}
