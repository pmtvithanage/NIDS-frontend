/**
 * Overview page constants: chart intervals, list limits and engine-breakdown
 * labels. Kept out of the components so the layout carries no magic numbers.
 * @module constants/overview
 */

import { SEVERITY } from './severity.js'

const HOUR_MS = 3_600_000

/** Selectable bucket sizes for the "Alerts over time" chart. */
export const OVERVIEW_CHART_INTERVALS = Object.freeze([
  { key: 'hour', label: '1h' },
  { key: '6h', label: '6h' },
  { key: 'day', label: '24h' },
])

/** Default bucket size for the "Alerts over time" chart. */
export const OVERVIEW_DEFAULT_INTERVAL = 'hour'

/** Bucket duration (ms) per interval key, used to derive a bucket's end. */
export const OVERVIEW_INTERVAL_MS = Object.freeze({
  hour: HOUR_MS,
  '6h': 6 * HOUR_MS,
  day: 24 * HOUR_MS,
})

/** Rows returned per ranked list widget. */
export const OVERVIEW_TOP_LIMIT = 5

/** Number of most-recent high-severity alerts shown in the ticker. */
export const OVERVIEW_TICKER_SIZE = 8

/** New ticker alerts are flushed at most this often, so it updates ≤ 1×/s (ms). */
export const OVERVIEW_TICKER_BATCH_MS = 1000

/** Height (px) of the Recharts plot areas on the overview. */
export const OVERVIEW_CHART_HEIGHT = 220

/** How often the ticker's relative timestamps are recomputed (ms). */
export const OVERVIEW_RELATIVE_REFRESH_MS = 30_000

/** CSS color variable per severity tier for charts. */
export const OVERVIEW_SEVERITY_COLOR = Object.freeze({
  [SEVERITY.LOW]: 'var(--sev-low)',
  [SEVERITY.MEDIUM]: 'var(--sev-medium)',
  [SEVERITY.HIGH]: 'var(--sev-high)',
  [SEVERITY.CRITICAL]: 'var(--sev-critical)',
})

/** Ranked list widgets: API dimension, title and the alerts filter they link to. */
export const OVERVIEW_TOP_LISTS = Object.freeze([
  { key: 'sources', by: 'src_ip', title: 'Top source IPs', filter: (value) => ({ ip: value }) },
  {
    key: 'ports',
    by: 'dst_port',
    title: 'Top destination ports',
    filter: (value) => ({ dst_port: value }),
  },
  {
    key: 'signatures',
    by: 'signature',
    title: 'Top signatures',
    filter: (value) => ({ signature: value }),
  },
])
