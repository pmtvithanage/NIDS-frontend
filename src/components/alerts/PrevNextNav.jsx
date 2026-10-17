import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Back link plus previous/next navigation across the list's current id set.
 * @param {{backTo: string, prevId?: string|null, nextId?: string|null,
 *   position?: number, total?: number, onNavigate: (id: string, index: number) => void}} props
 */
function PrevNextNav({ backTo, prevId, nextId, position = -1, total = 0, onNavigate }) {
  const showCounter = total > 0 && position >= 0
  return (
    <nav className="flex flex-wrap items-center justify-between gap-2">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to alerts
      </Link>
      <div className="flex items-center gap-2">
        {showCounter ? (
          <span className="text-xs tabular-nums text-muted">
            {position + 1} of {total}
          </span>
        ) : null}
        <button
          type="button"
          disabled={!prevId}
          onClick={() => onNavigate(prevId, position - 1)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Prev
        </button>
        <button
          type="button"
          disabled={!nextId}
          onClick={() => onNavigate(nextId, position + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

export default PrevNextNav
