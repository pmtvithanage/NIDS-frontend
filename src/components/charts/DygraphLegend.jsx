/**
 * Accessible legend rendered above a {@link module:components/charts/DygraphChart}.
 * Each entry shows a color dot (never color alone), the series name and its
 * latest / hovered value, and toggles the series on click.
 *
 * Values are written imperatively through the `setValues` handle so a streaming
 * chart can refresh them at most once per second without re-rendering React
 * (AGENTS.md §9).
 * @module components/charts/DygraphLegend
 */

import { forwardRef, useImperativeHandle, useRef } from 'react'

/**
 * Value placeholders are filled via {@link setValues}; React never owns their
 * text so the imperative writes survive parent re-renders.
 * @param {{
 *   info: {
 *     series: Array<{ name: string, color: string, visible: boolean }>,
 *     paused?: boolean,
 *     zoomed?: boolean,
 *   },
 *   formatter?: (info: object) => import('react').ReactNode,
 *   onToggle: (index: number) => void,
 * }} props
 * @param {import('react').Ref<{setValues: (values: string[]) => void}>} ref
 */
const DygraphLegend = forwardRef(function DygraphLegend({ info, formatter, onToggle }, ref) {
  const valueRefs = useRef([])

  useImperativeHandle(
    ref,
    () => ({
      /** @param {string[]} values Preformatted values, one per series. */
      setValues(values) {
        valueRefs.current.forEach((node, index) => {
          if (node) node.textContent = values?.[index] ?? '—'
        })
      },
    }),
    [],
  )

  if (formatter) return formatter(info)

  return (
    <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {info.series.map((entry, index) => {
        const hidden = entry.visible === false
        return (
          <button
            key={`${entry.name}-${index}`}
            type="button"
            onClick={() => onToggle(index)}
            aria-pressed={!hidden}
            title={`${entry.name} — toggle series`}
            className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-surface-2 ${
              hidden ? 'text-muted line-through opacity-60' : 'text-text'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
            <span
              ref={(node) => {
                valueRefs.current[index] = node
              }}
              className="tabular-nums text-muted"
            />
          </button>
        )
      })}
    </div>
  )
})

export default DygraphLegend
























