import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'

import { HUMAN_LABEL_OPTIONS } from '../../constants/alerts.js'

/**
 * Dialog to submit a human label plus an optional comment.
 * @param {{open: boolean, currentLabel?: string|null, busy?: boolean,
 *   onClose: () => void, onSubmit: (payload: {label: string, comment: string}) => void}} props
 */
function LabelDialog({ open, currentLabel, busy = false, onClose, onSubmit }) {
  const [label, setLabel] = useState(currentLabel ?? HUMAN_LABEL_OPTIONS[0])
  const [comment, setComment] = useState('')

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
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Label alert"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-xl"
      >
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Label this alert
        </h2>

        <fieldset className="mt-3">
          <legend className="text-xs text-muted">Ground-truth label</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {HUMAN_LABEL_OPTIONS.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                  label === option
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-border text-muted hover:bg-surface-2'
                }`}
              >
                <input
                  type="radio"
                  name="human-label"
                  value={option}
                  checked={label === option}
                  onChange={() => setLabel(option)}
                  className="accent-[var(--accent)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-3 block text-xs text-muted">
          Comment (optional)
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit({ label, comment: comment.trim() })}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Submit label'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LabelDialog
