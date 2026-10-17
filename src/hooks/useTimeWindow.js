import { useEffect, useMemo, useState } from 'react'

import { ALERT_WINDOW_REFRESH_MS } from '../constants/alerts.js'
import { rangeToWindow } from '../constants/time.js'

/**
 * Resolve the active time range into a stable {from, to} window.
 *
 * Preset ranges are recomputed on an interval (not every render) so the React
 * Query key stays stable between refetches.
 *
 * @param {string} range Preset key or `custom`.
 * @param {string} [from] Custom lower bound (ISO).
 * @param {string} [to] Custom upper bound (ISO).
 * @param {number} [refreshMs] Recompute interval for preset ranges.
 * @returns {{from: string|null, to: string|null}}
 */
export function useTimeWindow(range, from, to, refreshMs = ALERT_WINDOW_REFRESH_MS) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (range === 'custom') return undefined
    const id = setInterval(() => setNow(Date.now()), refreshMs)
    return () => clearInterval(id)
  }, [range, refreshMs])

  return useMemo(() => {
    if (range === 'custom') return { from: from || null, to: to || null }
    return rangeToWindow(range, now) ?? { from: null, to: null }
  }, [range, from, to, now])
}
