/**
 * Pure helpers shared by the dygraphs wrapper: CSS-variable color resolution,
 * row-buffer utilities, value formatting and canvas threshold drawing.
 * @module utils/dygraph
 */

import { DYGRAPH_FALLBACK_COLOR, DYGRAPH_THEME_VARS } from '../constants/charts.js'

/**
 * Read a CSS custom property from the document root.
 * @param {string} name Variable name, with or without the leading `--`.
 * @returns {string} The trimmed value, or an empty string when unavailable.
 */
export function resolveCssVar(name) {
  if (typeof window === 'undefined' || !name) return ''
  const key = name.startsWith('--') ? name : `--${name}`
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim()
  } catch {
    return ''
  }
}

/**
 * Resolve a list of color values. Entries starting with `--` are treated as CSS
 * variables; anything else is passed through. Missing values fall back.
 * @param {string[]} [values] Color values or CSS variable names.
 * @param {string} [fallback] Fallback color.
 * @returns {string[]} Resolved colors.
 */
export function resolveColors(values = [], fallback = DYGRAPH_FALLBACK_COLOR) {
  return values.map((value) => {
    if (!value) return fallback
    return value.startsWith('--') ? resolveCssVar(value) || fallback : value
  })
}

/**
 * Resolve the axis / grid / label / background colors from CSS variables.
 * @returns {{axis: string, grid: string, label: string, background: string}}
 */
export function resolveThemeColors() {
  return {
    axis: resolveCssVar(DYGRAPH_THEME_VARS.axis) || DYGRAPH_FALLBACK_COLOR,
    grid: resolveCssVar(DYGRAPH_THEME_VARS.grid) || DYGRAPH_FALLBACK_COLOR,
    label: resolveCssVar(DYGRAPH_THEME_VARS.label) || DYGRAPH_FALLBACK_COLOR,
    background: resolveCssVar(DYGRAPH_THEME_VARS.background) || DYGRAPH_FALLBACK_COLOR,
  }
}

/**
 * Copy at most `maxPoints` trailing rows from a data set.
 * @param {Array<Array<Date|number>>} rows Data rows.
 * @param {number} maxPoints Ring-buffer capacity.
 * @returns {Array<Array<Date|number>>} Trimmed copy.
 */
export function trimRows(rows, maxPoints) {
  if (!Array.isArray(rows)) return []
  return rows.length > maxPoints ? rows.slice(rows.length - maxPoints) : rows.slice()
}

/**
 * @param {Array<Array<Date|number>>} rows Data rows.
 * @returns {Array<Date|number>|null} The most recent row.
 */
export function lastRow(rows) {
  return rows.length ? rows[rows.length - 1] : null
}

/**
 * Format a value for the legend / accessible summary.
 * @param {unknown} value Raw value.
 * @returns {string} Display value.
 */
export function formatChartValue(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return String(value)
}

/**
 * Find the row index whose x-value is closest to `ts`.
 * @param {Array<Array<Date|number>>} rows Data rows (sorted ascending by x).
 * @param {Date|number|string} ts Target timestamp.
 * @returns {number} Row index, or -1 when the buffer is empty/irrelevant.
 */
export function findNearestRow(rows, ts) {
  if (!Array.isArray(rows) || rows.length === 0) return -1
  const target = ts instanceof Date ? ts.getTime() : new Date(ts).getTime()
  if (!Number.isFinite(target)) return -1
  let best = -1
  let bestDelta = Infinity
  for (let index = 0; index < rows.length; index += 1) {
    const value = rows[index]?.[0]
    const ms = value instanceof Date ? value.getTime() : new Date(value).getTime()
    if (!Number.isFinite(ms)) continue
    const delta = Math.abs(ms - target)
    if (delta < bestDelta) {
      bestDelta = delta
      best = index
    }
    if (ms > target) break
  }
  return best
}

/**
 * Fill shaded bands (e.g. "over threshold" red zones) behind the data.
 * @param {CanvasRenderingContext2D} ctx Dygraphs rendering context.
 * @param {{x: number, y: number, w: number, h: number}} area Plot area.
 * @param {object} graph Dygraph instance (used for `toDomYCoord`).
 * @param {Array<{from: number, to?: number, color?: string, opacity?: number, axis?: number}>} bands
 */
export function drawBands(ctx, area, graph, bands) {
  if (!bands?.length || !graph) return
  bands.forEach((band) => {
    if (!band || typeof band.from !== 'number') return
    const axis = band.axis ?? 0
    const top = Number.isFinite(band.to) ? graph.toDomYCoord(band.to, axis) : area.y
    const bottom = graph.toDomYCoord(band.from, axis)
    if (!Number.isFinite(top) || !Number.isFinite(bottom)) return
    const y = Math.max(area.y, top)
    const height = Math.min(area.y + area.h, bottom) - y
    if (height <= 0) return
    ctx.save()
    ctx.fillStyle = resolveColors([band.color || DYGRAPH_FALLBACK_COLOR])[0]
    ctx.globalAlpha = band.opacity ?? 0.12
    ctx.fillRect(area.x, y, area.w, height)
    ctx.restore()
  })
}

/**
 * Draw horizontal threshold lines on the dygraphs canvas.
 * @param {CanvasRenderingContext2D} ctx Dygraphs rendering context.
 * @param {{x: number, w: number}} area Plot area.
 * @param {object} graph Dygraph instance (used for `toDomYCoord`).
 * @param {Array<{value: number, color?: string, label?: string, axis?: number}>} lines Thresholds.
 */
export function drawThresholdLines(ctx, area, graph, lines) {
  if (!lines?.length || !graph) return
  lines.forEach((line) => {
    if (!line || typeof line.value !== 'number') return
    const y = graph.toDomYCoord(line.value, line.axis ?? 0)
    if (!Number.isFinite(y)) return
    const color = line.color ? resolveColors([line.color])[0] : DYGRAPH_FALLBACK_COLOR
    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(area.x, y)
    ctx.lineTo(area.x + area.w, y)
    ctx.stroke()
    if (line.label) {
      ctx.font = '10px ui-sans-serif, system-ui, sans-serif'
      ctx.fillText(line.label, area.x + 4, y - 3)
    }
    ctx.restore()
  })
}
