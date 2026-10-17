import { useState } from 'react'
import { Loader2, ShieldOff, Tag } from 'lucide-react'

/**
 * Analyst action panel: editable notes (autosave on blur), label and
 * suppression entry points.
 * @param {{detail: object, savingNotes?: boolean, suppressBusy?: boolean,
 *   onSaveNotes: (notes: string) => void, onOpenLabel: () => void,
 *   onOpenSuppress: () => void}} props
 */
function AnalystActions({ detail, savingNotes = false, suppressBusy = false, onSaveNotes, onOpenLabel, onOpenSuppress }) {
  const [notes, setNotes] = useState(detail.notes ?? '')

  const saved = detail.notes ?? ''
  const dirty = notes !== saved

  const statusText = savingNotes ? 'Saving…' : dirty ? 'Unsaved changes' : 'Saved'

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-3">
      <h2 className="text-sm font-semibold text-text">Analyst actions</h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenLabel}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2"
        >
          <Tag className="h-3.5 w-3.5" aria-hidden="true" />
          Label
          {detail.human_label ? (
            <span className="rounded bg-accent/15 px-1 text-[10px] uppercase text-accent">
              {detail.human_label}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onOpenSuppress}
          disabled={suppressBusy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
        >
          <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
          Create suppression
        </button>
      </div>

      <label className="block text-xs text-muted">
        <span className="flex items-center justify-between">
          <span>Notes</span>
          <span className={`inline-flex items-center gap-1 ${dirty ? 'text-sev-medium' : ''}`}>
            {savingNotes ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
            {statusText}
          </span>
        </span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => {
            if (dirty) onSaveNotes(notes)
          }}
          rows={5}
          placeholder="Add triage notes… (saved when you click away)"
          className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>
    </section>
  )
}

export default AnalystActions
