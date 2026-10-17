import { useEffect, useRef } from 'react'

import { subscribeAlerts } from '../api/stream.js'

/**
 * Subscribe to the real-time alert feed for the component lifetime.
 * @param {(alert: object) => void} onAlert Callback per incoming alert.
 * @param {{minSeverity?: string, enabled?: boolean}} [options]
 */
export function useAlertStream(onAlert, options = {}) {
  const { minSeverity, enabled = true } = options
  const callbackRef = useRef(onAlert)

  useEffect(() => {
    callbackRef.current = onAlert
  }, [onAlert])

  useEffect(() => {
    if (!enabled) return undefined
    const unsubscribe = subscribeAlerts((alert) => callbackRef.current?.(alert), { minSeverity })
    return unsubscribe
  }, [minSeverity, enabled])
}
