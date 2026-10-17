/**
 * Pulsing placeholder rows.
 * @param {{rows?: number, className?: string}} props
 */
function LoadingSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-9 animate-pulse rounded-md bg-surface-2" />
      ))}
    </div>
  )
}

export default LoadingSkeleton
