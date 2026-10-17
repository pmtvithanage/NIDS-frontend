import { useCallback, useEffect, useRef, useState } from 'react'

import { ALERT_LIVE_BATCH_MS } from '../constants/alerts.js'
import { useAlertStream } from './useAlertStream.js'

/**
 * Live alert feed with a buffer that never shifts the table on its own.
 *
 * Incoming alerts accumulate in a ref and are flushed into `pendingAlerts`
 * at most once every {@link ALERT_LIVE_BATCH_MS} milliseconds, so a bursty
 * stream cannot trigger a render per event. The page decides when to merge
 * the pending batch. Pausing unsubscribes from the stream entirely.
 *
 * @returns {{paused: boolean, togglePause: () => void, pendingCount: number,
 *   clear: () => void}}
 */
export function useAlertsLive() {
  const [paused, setPaused] = useState(false)
  const [pendingAlerts, setPendingAlerts] = useState([])
  const bufferRef = useRef([])

  const onAlert = useCallback((alert) => {
    bufferRef.current.push(alert)
  }, [])

  useAlertStream(onAlert, { enabled: !paused })

  useEffect(() => {
    const id = setInterval(() => {
      if (bufferRef.current.length === 0) return
      const batch = bufferRef.current
      bufferRef.current = []
      setPendingAlerts((prev) => [...batch.reverse(), ...prev])
    }, ALERT_LIVE_BATCH_MS)
    return () => clearInterval(id)
  }, [])

  const togglePause = useCallback(() => setPaused((prev) => !prev), [])
  const clear = useCallback(() => {
    bufferRef.current = []
    setPendingAlerts([])
  }, [])

  return { paused, togglePause, pendingCount: pendingAlerts.length, clear }
}
