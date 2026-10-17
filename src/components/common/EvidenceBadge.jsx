import { memo } from 'react'

const QUALITY_STYLE = {
  low: 'bg-sev-low/15 text-sev-low',
  medium: 'bg-sev-medium/15 text-sev-medium',
  high: 'bg-sev-critical/15 text-sev-critical',
}

/**
 * Evidence quality chip plus an optional "likely noise" chip.
 * @param {{quality?: 'low'|'medium'|'high', likelyBenign?: boolean, score?: number, className?: string}} props
 */
function EvidenceBadge({ quality = 'low', likelyBenign = false, score, className = '' }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${QUALITY_STYLE[quality] ?? 'bg-surface-2 text-muted'}`}
      >
        {quality} evidence
      </span>
      {typeof score === 'number' ? (
        <span className="text-xs tabular-nums text-muted">{score}</span>
      ) : null}
      {likelyBenign ? (
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
          likely noise
        </span>
      ) : null}
    </span>
  )
}

export default memo(EvidenceBadge)
