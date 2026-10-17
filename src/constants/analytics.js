/**
 * Analytics page constants: heatmap axes, top-N limits, scatter defaults,
 * country pool and MLP-label colors.
 * @module constants/analytics
 */

import { LABEL } from './labels.js'

/** Weekday labels ordered Monday → Sunday (index 0 = Monday). */
export const HEATMAP_WEEKDAYS = Object.freeze(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])

/** Hour buckets 0-23 for the heatmap columns. */
export const HEATMAP_HOURS = Object.freeze(Array.from({ length: 24 }, (_, hour) => hour))

/** Number of entries shown in the top-talkers and port tables. */
export const ANALYTICS_TOP_LIMIT = 10

/** Maximum scatter points returned by the feature explorer. */
export const SCATTER_LIMIT = 400

/** Dot radius (px) for scatter points. */
export const SCATTER_DOT_RADIUS = 3

/** Heatmap SVG geometry (px). */
export const HEATMAP_CELL = 16
export const HEATMAP_GAP = 3
export const HEATMAP_LEFT = 36
export const HEATMAP_TOP = 16

/** Show an hour-axis tick every N hours. */
export const HEATMAP_HOUR_TICK = 3

/** Default feature pair for the scatter explorer. */
export const SCATTER_DEFAULT_X = 'Flow Duration'
export const SCATTER_DEFAULT_Y = 'Flow Bytes/s'

/** URL-synced defaults for the feature explorer. */
export const SCATTER_FILTER_DEFAULTS = Object.freeze({
  x: SCATTER_DEFAULT_X,
  y: SCATTER_DEFAULT_Y,
})

/** Pool used to assign an external peer a deterministic country. */
export const COUNTRY_POOL = Object.freeze([
  'US',
  'CN',
  'DE',
  'RU',
  'GB',
  'IN',
  'NL',
  'SG',
  'BR',
  'JP',
])

/** Home country label for internal (private-range) peers. */
export const INTERNAL_COUNTRY = 'LK (internal)'

/** Colors per MLP label used by the scatter plot. */
export const LABEL_COLORS = Object.freeze({
  [LABEL.BENIGN]: 'var(--sev-low)',
  [LABEL.DDOS]: 'var(--sev-critical)',
  [LABEL.PORT_SCAN]: 'var(--sev-medium)',
  [LABEL.BOT]: 'var(--sev-high)',
  [LABEL.WEB_ATTACK]: 'var(--accent)',
  [LABEL.BRUTE_FORCE]: 'var(--sev-medium)',
  [LABEL.INFILTRATION]: 'var(--sev-critical)',
  [LABEL.HEARTBLEED]: 'var(--sev-critical)',
  [LABEL.PATATOR]: 'var(--sev-high)',
  [LABEL.DOS]: 'var(--sev-high)',
  [LABEL.UNKNOWN]: 'var(--muted)',
})

/** Fallback color for labels without an explicit mapping. */
export const LABEL_FALLBACK_COLOR = 'var(--muted)'
