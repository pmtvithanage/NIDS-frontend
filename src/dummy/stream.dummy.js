/**
 * Dummy real-time alert stream.
 *
 * The real implementation uses `EventSource` against GET /api/v1/stream/alerts.
 * Here we simulate the feed with `setInterval`: a new alert is generated every
 * 3-6 seconds, pushed into the shared store, and delivered to the subscriber.
 * @module dummy/stream.dummy
 */

import { createLiveAlert } from './alerts.dummy.js'
import { pushAlert } from './store.js'
import { SEVERITY_ORDER } from '../constants/severity.js'

const MIN_INTERVAL_MS = 3000
const MAX_INTERVAL_MS = 6000

function passesSeverity(alert, minSeverity) {
  if (!minSeverity) return true
  return SEVERITY_ORDER.indexOf(alert.severity_tier) >= SEVERITY_ORDER.indexOf(minSeverity)
}

/**
 * Subscribe to the simulated alert stream.
 * @param {(alert: object) => void} onAlert Callback invoked per alert.
 * @param {{minSeverity?: string}} [options] Optional severity floor.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAlerts(onAlert, options = {}) {
  let timer = null
  let stopped = false

  const schedule = () => {
    const wait = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)
    timer = setTimeout(() => {
      if (stopped) return
      const alert = createLiveAlert()
      pushAlert(alert)
      if (passesSeverity(alert, options.minSeverity)) onAlert(alert)
      schedule()
    }, wait)
  }

  schedule()

  return function unsubscribe() {
    stopped = true
    if (timer) clearTimeout(timer)
  }
}
