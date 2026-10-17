import { Loader2, ShieldOff, X } from 'lucide-react'

import { ASSIGNEES } from '../../constants/assignees.js'
import { LABELS } from '../../constants/labels.js'
import { ALERT_STATUSES, ALERT_STATUS_LABEL } from '../../constants/statuses.js'

const SELECT_CLASS =
  'rounded-md border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60'

/**
 * Bar of bulk actions for the current selection.
 * @param {{count: number, busy: boolean, onClear: () => void,
 *   onSetStatus: (status: string) => void, onAssign: (assignee: string) => void,
 *   onLabel: (label: string) => void, onSuppress: () => void}} props
 */
function BulkActionBar({ count, busy, onClear, onSetStatus, onAssign, onLabel, onSuppress }) {
  if (count === 0) return null

  return (
    <div className="sticky bottom-0 z-20 mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 shadow-lg">
      <span className="text-xs font-medium text-text">
        {count} selected
        {busy ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
      </span>

      <select
        aria-label="Set status"
        value=""
        disabled={busy}
        onChange={(event) => event.target.value && onSetStatus(event.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Set status…</option>
        {ALERT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ALERT_STATUS_LABEL[status]}
          </option>
        ))}
      </select>

      <select
        aria-label="Assign to"
        value=""
        disabled={busy}
        onChange={(event) => event.target.value && onAssign(event.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Assign to…</option>
        {ASSIGNEES.map((assignee) => (
          <option key={assignee} value={assignee}>
            {assignee}
          </option>
        ))}
      </select>

      <select
        aria-label="Apply label"
        value=""
        disabled={busy}
        onChange={(event) => event.target.value && onLabel(event.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Apply label…</option>
        {LABELS.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onSuppress}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
      >
        <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
        Suppress
      </button>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-text"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear
      </button>
    </div>
  )
}

export default BulkActionBar
