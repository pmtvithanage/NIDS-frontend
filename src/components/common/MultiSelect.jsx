import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * Accessible multi-select dropdown with checkboxes.
 * @param {{label: string, options: Array<{value: string, label: string}>, value?: string[],
 *   onChange: (next: string[]) => void, className?: string}} props
 */
function MultiSelect({ label, options, value = [], onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (val) => {
    onChange(value.includes(val) ? value.filter((item) => item !== val) : [...value, val])
  }

  const summary =
    value.length === 0
      ? label
      : value.length === 1
        ? (options.find((option) => option.value === value[0])?.label ?? value[0])
        : `${label} (${value.length})`

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex w-full min-w-[8rem] items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 z-30 mt-1 max-h-64 w-56 overflow-auto rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          {options.map((option) => {
            const active = value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-surface-2"
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    active ? 'border-accent bg-accent text-accent-fg' : 'border-border'
                  }`}
                >
                  {active ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : null}
                </span>
                <span className="truncate text-text">{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default MultiSelect
