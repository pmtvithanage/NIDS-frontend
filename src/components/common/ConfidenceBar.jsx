import { memo } from 'react'

/**
 * Horizontal confidence bar (0-1).
 * @param {{value?: number, label?: string, className?: string}} props
 */
function ConfidenceBar({ value = 0, label, className = '' }) {
  const clamped = Math.min(Math.max(value, 0), 1)
  const pct = Math.round(clamped * 100)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'confidence'}
        className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted">{pct}%</span>
    </div>
  )
}

export default memo(ConfidenceBar)
