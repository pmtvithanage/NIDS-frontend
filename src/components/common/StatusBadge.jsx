import { memo } from 'react'

import { ALERT_STATUS_LABEL, INCIDENT_STATUS_LABEL } from '../../constants/statuses.js'

const STYLES = {
  new: 'bg-accent/10 text-accent',
  acknowledged: 'bg-surface-2 text-muted',
  investigating: 'bg-sev-medium/15 text-sev-medium',
  triaging: 'bg-sev-medium/15 text-sev-medium',
  confirmed: 'bg-sev-critical/15 text-sev-critical',
  false_positive: 'bg-surface-2 text-muted',
  open: 'bg-accent/10 text-accent',
  contained: 'bg-sev-medium/15 text-sev-medium',
  resolved: 'bg-sev-low/15 text-sev-low',
  closed: 'bg-surface-2 text-muted',
  dismissed: 'bg-surface-2 text-muted',
}

/**
 * Status pill for alerts and incidents.
 * @param {{status: string, kind?: 'alert'|'incident', className?: string}} props
 */
function StatusBadge({ status, kind = 'alert', className = '' }) {
  const key = String(status || '').toLowerCase()
  const map = kind === 'incident' ? INCIDENT_STATUS_LABEL : ALERT_STATUS_LABEL
  const label = map[key] ?? key ?? 'Unknown'
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STYLES[key] ?? 'bg-surface-2 text-muted'} ${className}`}
    >
      {label}
    </span>
  )
}

export default memo(StatusBadge)
