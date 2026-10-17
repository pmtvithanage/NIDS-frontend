/**
 * Time-range presets used by the global time picker and API queries.
 * @module constants/time
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** @type {ReadonlyArray<{key:string, label:string, ms:number|null}>} */
export const TIME_RANGES = Object.freeze([
  { key: '15m', label: '15m', ms: 15 * MINUTE },
  { key: '1h', label: '1h', ms: HOUR },
  { key: '24h', label: '24h', ms: DAY },
  { key: '7d', label: '7d', ms: 7 * DAY },
  { key: 'custom', label: 'Custom', ms: null },
])

/** Default time-range key. */
export const DEFAULT_TIME_RANGE = '24h'

/**
 * Resolve a preset key to an absolute {from, to} ISO window.
 * @param {string} key Preset key.
 * @param {number} [now=Date.now()] Reference time (ms).
 * @returns {{from: string, to: string}|null} Window, or null for custom.
 */
export function rangeToWindow(key, now = Date.now()) {
  const preset = TIME_RANGES.find((range) => range.key === key)
  if (!preset || preset.ms == null) return null
  return {
    from: new Date(now - preset.ms).toISOString(),
    to: new Date(now).toISOString(),
  }
}
