/**
 * Display formatting helpers.
 * Timestamps are transported as ISO UTC strings and displayed in the user's
 * local timezone (default Asia/Colombo).
 * @module utils/format
 */

/** Default display timezone. */
export const DEFAULT_TIMEZONE = 'Asia/Colombo'

const MS_PER_SECOND = 1000
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
const BYTE_BASE = 1024

/**
 * Format an ISO UTC timestamp in the given timezone.
 * @param {string} iso ISO 8601 timestamp.
 * @param {{ timeZone?: string, locale?: string, withSeconds?: boolean }} [options]
 * @returns {string} Localized timestamp, or '' when invalid.
 */
export function formatTs(
  iso,
  { timeZone = DEFAULT_TIMEZONE, locale = 'en-GB', withSeconds = true } = {},
) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(date)
}

/**
 * Format a byte count using binary units.
 * @param {number} bytes Byte count.
 * @param {number} [digits=1] Fraction digits.
 * @returns {string} e.g. "1.5 KB".
 */
export function formatBytes(bytes, digits = 1) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  let value = bytes
  let unit = 0
  while (value >= BYTE_BASE && unit < BYTE_UNITS.length - 1) {
    value /= BYTE_BASE
    unit += 1
  }
  return `${value.toFixed(unit === 0 ? 0 : digits)} ${BYTE_UNITS[unit]}`
}

/**
 * Format a duration given in microseconds.
 * @param {number} microseconds Duration in microseconds.
 * @returns {string} e.g. "1.2 s", "350 ms", "120 µs".
 */
export function formatDuration(microseconds) {
  if (!Number.isFinite(microseconds) || microseconds < 0) return '0 µs'
  if (microseconds < MS_PER_SECOND) {
    return `${microseconds.toFixed(0)} µs`
  }
  const seconds = microseconds / MS_PER_SECOND / MS_PER_SECOND
  if (seconds < 1) {
    return `${(microseconds / MS_PER_SECOND).toFixed(0)} ms`
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`
  }
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds % 60)}s`
}

/**
 * Format a ratio (e.g. AE error over threshold).
 * @param {number} ratio Ratio value.
 * @param {number} [digits=2] Fraction digits.
 * @returns {string} e.g. "744.86x".
 */
export function formatRatio(ratio, digits = 2) {
  if (!Number.isFinite(ratio)) return '—'
  return `${ratio.toFixed(digits)}x`
}

const RELATIVE_JUST_NOW_SEC = 5
const RELATIVE_STEPS = [
  { limitSec: 60, divisor: 1, unit: 's' },
  { limitSec: 3_600, divisor: 60, unit: 'm' },
  { limitSec: 86_400, divisor: 3_600, unit: 'h' },
  { limitSec: 2_592_000, divisor: 86_400, unit: 'd' },
]
const RELATIVE_DAY_SEC = 86_400

/**
 * Format a timestamp as a short relative string ("42s ago", "3h ago").
 * @param {string} iso ISO 8601 timestamp.
 * @param {number} [now] Reference time in ms (defaults to now).
 * @returns {string} Relative label, or '' when invalid.
 */
export function formatRelative(iso, now = Date.now()) {
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ''
  const diffSec = Math.max(0, Math.round((now - time) / MS_PER_SECOND))
  if (diffSec < RELATIVE_JUST_NOW_SEC) return 'just now'
  for (const step of RELATIVE_STEPS) {
    if (diffSec < step.limitSec) {
      return `${Math.floor(diffSec / step.divisor)}${step.unit} ago`
    }
  }
  return `${Math.floor(diffSec / RELATIVE_DAY_SEC)}d ago`
}
