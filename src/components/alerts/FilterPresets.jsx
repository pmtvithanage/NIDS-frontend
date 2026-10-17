import { useEffect, useRef, useState } from 'react'
import { Bookmark, ChevronDown, Save, Trash2 } from 'lucide-react'

/**
 * Saved filter presets dropdown (save current view, apply, delete).
 * @param {{presets: Array<{name: string, filters: object}>, onSave: (name: string) => void,
 *   onApply: (filters: object) => void, onRemove: (name: string) => void}} props
 */
function FilterPresets({ presets, onSave, onApply, onRemove }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
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

  const submit = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    onSave(name.trim())
    setName('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2"
      >
        <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
        Presets
        <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-64 rounded-md border border-border bg-surface p-2 shadow-lg"
        >
          <form onSubmit={submit} className="flex items-center gap-1.5">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Save current view…"
              aria-label="Preset name"
              className="min-w-0 flex-1 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              aria-label="Save preset"
              className="rounded-md border border-border p-1.5 text-muted hover:bg-surface-2 hover:text-text"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
          <ul className="mt-2 space-y-1">
            {presets.length === 0 ? (
              <li className="px-2 py-1 text-xs text-muted">No saved presets</li>
            ) : (
              presets.map((preset) => (
                <li key={preset.name} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onApply(preset.filters)
                      setOpen(false)
                    }}
                    className="min-w-0 flex-1 truncate rounded px-2 py-1 text-left text-xs text-text hover:bg-surface-2"
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete preset ${preset.name}`}
                    onClick={() => onRemove(preset.name)}
                    className="rounded p-1 text-muted hover:bg-surface-2 hover:text-sev-critical"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default FilterPresets
