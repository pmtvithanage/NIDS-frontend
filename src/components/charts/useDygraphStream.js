/**
 * Ring-buffer + throttled refresh logic for streaming charts.
 *
 * Appended rows are written to a buffer outside React state and the redraw
 * callback runs at most once per `refreshMs`, so a bursty stream cannot trigger
 * a render per message (see AGENTS.md §9).
 * @module components/charts/useDygraphStream
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { DYGRAPH_REFRESH_MS } from '../../constants/charts.js'
import { trimRows } from '../../utils/dygraph.js'

/**
 * @param {{
 *   maxPoints: number,
 *   redraw: (rows: Array<Array<Date|number>>) => void,
 *   initialRows?: Array<Array<Date|number>>,
 *   refreshMs?: number,
 * }} options
 * @returns {{
 *   bufferRef: import('react').MutableRefObject<Array<Array<Date|number>>>,
 *   paused: boolean,
 *   markFresh: () => void,
 *   replace: (rows: Array<Array<Date|number>>) => void,
 *   append: (rows: Array<Array<Date|number>>) => void,
 *   setData: (rows: Array<Array<Date|number>>) => void,
 *   pause: () => void,
 *   resume: () => void,
 *   stop: () => void,
 * }}
 */
export function useDygraphStream({ maxPoints, redraw, initialRows = [], refreshMs = DYGRAPH_REFRESH_MS }) {
  const bufferRef = useRef(initialRows)
  const redrawRef = useRef(redraw)
  const pausedRef = useRef(false)
  const pendingRef = useRef(false)
  const rafRef = useRef(0)
  const timerRef = useRef(0)
  const lastRef = useRef(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    redrawRef.current = redraw
  })

  const markFresh = useCallback(() => {
    lastRef.current = performance.now()
  }, [])

  const schedule = useCallback(() => {
    if (pendingRef.current || pausedRef.current) return
    pendingRef.current = true
    const tick = () => {
      if (pausedRef.current) {
        pendingRef.current = false
        return
      }
      const remaining = refreshMs - (performance.now() - lastRef.current)
      if (remaining > 0) {
        timerRef.current = window.setTimeout(() => {
          rafRef.current = window.requestAnimationFrame(tick)
        }, remaining)
        return
      }
      pendingRef.current = false
      lastRef.current = performance.now()
      redrawRef.current?.(bufferRef.current)
    }
    rafRef.current = window.requestAnimationFrame(tick)
  }, [refreshMs])

  const replace = useCallback(
    (rows) => {
      bufferRef.current = trimRows(rows, maxPoints)
      markFresh()
      schedule()
    },
    [maxPoints, markFresh, schedule],
  )

  const append = useCallback(
    (rows) => {
      if (!rows?.length) return
      const next = bufferRef.current.concat(rows)
      bufferRef.current = next.length > maxPoints ? next.slice(next.length - maxPoints) : next
      schedule()
    },
    [maxPoints, schedule],
  )

  const setData = useCallback(
    (rows) => {
      bufferRef.current = trimRows(rows, maxPoints)
      markFresh()
      redrawRef.current?.(bufferRef.current)
    },
    [maxPoints, markFresh],
  )

  const pause = useCallback(() => {
    pausedRef.current = true
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    setPaused(false)
    markFresh()
    redrawRef.current?.(bufferRef.current)
  }, [markFresh])

  const stop = useCallback(() => {
    window.clearTimeout(timerRef.current)
    window.cancelAnimationFrame(rafRef.current)
    pendingRef.current = false
  }, [])

  return { bufferRef, paused, markFresh, replace, append, setData, pause, resume, stop }
}
