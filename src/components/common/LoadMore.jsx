import { Loader2 } from 'lucide-react'

/**
 * Cursor pagination control.
 * @param {{meta?: {total?: number, has_more?: boolean}, count?: number,
 *   onLoadMore: () => void, loading?: boolean, className?: string}} props
 */
function LoadMore({ meta, count = 0, onLoadMore, loading = false, className = '' }) {
  const total = meta?.total ?? count

  if (!meta?.has_more) {
    return (
      <p className={`text-center text-xs text-muted ${className}`}>
        Showing all {total} results
      </p>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-2 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
        Load more
      </button>
      <span className="text-xs tabular-nums text-muted">
        {count} of {total}
      </span>
    </div>
  )
}

export default LoadMore
