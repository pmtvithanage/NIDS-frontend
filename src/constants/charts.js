/**
 * Real-time chart constants (dygraphs).
 * @module constants/charts
 */

/** Default chart height in pixels. */
export const DYGRAPH_DEFAULT_HEIGHT = 220

/** Default ring-buffer capacity (points kept per chart). */
export const DYGRAPH_DEFAULT_MAX_POINTS = 900

/** Minimum delay between chart redraws while streaming (ms). */
export const DYGRAPH_REFRESH_MS = 1000

/** CSS variables used by the dygraphs theme resolver. */
export const DYGRAPH_THEME_VARS = Object.freeze({
  axis: '--border',
  grid: '--border',
  label: '--muted',
  background: '--surface',
})

/** Fallback color when a CSS variable cannot be resolved. */
export const DYGRAPH_FALLBACK_COLOR = '#888888'
