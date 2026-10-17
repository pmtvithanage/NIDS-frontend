import { useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['j', 'k'], label: 'Move focus down / up' },
  { keys: ['Enter'], label: 'Open focused alert' },
  { keys: ['a'], label: 'Acknowledge focused alert' },
  { keys: ['f'], label: 'Mark focused alert false positive' },
  { keys: ['/'], label: 'Focus search' },
  { keys: ['?'], label: 'Toggle this help' },
  { keys: ['Esc'], label: 'Close dialogs' },
]

/**
 * Keyboard shortcuts help dialog.
 * @param {{open: boolean, onClose: () => void}} props
 */
function KeyboardHelp({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="rounded p-1 text-muted hover:bg-surface-2 hover:text-text"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <dl className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between gap-3">
              <dt className="text-xs text-muted">{shortcut.label}</dt>
              <dd className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text"
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default KeyboardHelp
