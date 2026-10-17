import { memo } from 'react'

import { SEVERITY_LABEL } from '../../constants/severity.js'

const DOT_CLASS = {
  LOW: 'bg-sev-low',
  MEDIUM: 'bg-sev-medium',
  HIGH: 'bg-sev-high',
  CRITICAL: 'bg-sev-critical',
}

/**
 * Severity rendered as a colored dot plus text (never color alone).
 * @param {{tier: string, className?: string}} props
 */
function SeverityBadge({ tier, className = '' }) {
  const key = String(tier || '').toUpperCase()
  const label = SEVERITY_LABEL[key] ?? key ?? 'Unknown'
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASS[key] ?? 'bg-muted'}`}
        aria-hidden="true"
      />
      <span className="text-xs font-semibold uppercase tracking-wide text-text">{label}</span>
    </span>
  )
}

export default memo(SeverityBadge)
