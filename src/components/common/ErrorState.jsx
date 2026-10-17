import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Error block with an optional retry action.
 * @param {{error?: Error|{message?: string}, onRetry?: () => void, className?: string}} props
 */
function ErrorState({ error, onRetry, className = '' }) {
  const message = error?.message ?? 'Something went wrong while loading data.'
  return (
    <div className={`flex flex-col items-center gap-3 py-12 text-center ${className}`}>
      <AlertTriangle className="h-8 w-8 text-sev-critical" aria-hidden="true" />
      <p className="text-sm font-medium text-text">Failed to load</p>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  )
}

export default ErrorState
