import { AlertTriangle, Loader2, ShieldOff } from 'lucide-react'

import { isLowEvidence, lowEvidenceReason } from '../../utils/evidenceNarrative.js'

/**
 * Banner shown when an alert is flagged as low-evidence noise, with a one-click
 * suppress action for the firing signature.
 * @param {{detail: object, onSuppress: () => void, suppressing?: boolean}} props
 */
function LowEvidenceBanner({ detail, onSuppress, suppressing = false }) {
  if (!isLowEvidence(detail)) return null

  return (
    <section
      role="status"
      className="flex flex-wrap items-start gap-3 rounded-lg border border-sev-medium/40 bg-sev-medium/10 p-3"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sev-medium" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">Low evidence — possible noise</p>
        <p className="mt-0.5 text-xs text-muted">{lowEvidenceReason(detail)}</p>
      </div>
      <button
        type="button"
        onClick={onSuppress}
        disabled={suppressing}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text hover:bg-surface-2 disabled:opacity-60"
      >
        {suppressing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        Suppress this signature
      </button>
    </section>
  )
}

export default LowEvidenceBanner
