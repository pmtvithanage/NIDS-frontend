/**
 * Resolves dygraphs colors from CSS variables and re-resolves them whenever the
 * theme changes. Dygraphs draws on `<canvas>`, so it cannot read CSS variables.
 * @module components/charts/useDygraphTheme
 */

import { useEffect, useMemo, useState } from 'react'

import { resolveColors, resolveThemeColors } from '../../utils/dygraph.js'

/**
 * Track `<html>` class / `data-theme` changes and OS color-scheme changes.
 * Returns a revision counter that increments on every theme change, so callers
 * can re-resolve colors from CSS variables (canvas cannot read them itself).
 * @returns {number} Monotonic theme revision.
 */
export function useThemeRevision() {
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const bump = () => setRevision((value) => value + 1)
    const observer = new MutationObserver((records) => {
      const themed = records.some(
        (record) => record.attributeName === 'class' || record.attributeName === 'data-theme',
      )
      if (themed) bump()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })

    let media = null
    try {
      media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', bump)
    } catch {
      media = null
    }

    return () => {
      observer.disconnect()
      media?.removeEventListener('change', bump)
    }
  }, [])

  return revision
}

/**
 * Resolve the dygraphs palette (axis, grid, label, background) plus the series
 * colors, re-resolving on every theme change.
 * @param {string[]} [seriesVars] Series colors / CSS variable names.
 * @returns {{series: string[], axis: string, grid: string, label: string, background: string, revision: number}}
 */
export function useDygraphTheme(seriesVars = []) {
  const revision = useThemeRevision()
  const seriesKey = seriesVars.join('|')

  return useMemo(() => {
    const series = seriesKey ? resolveColors(seriesKey.split('|')) : []
    return { ...resolveThemeColors(), series, revision }
  }, [seriesKey, revision])
}
