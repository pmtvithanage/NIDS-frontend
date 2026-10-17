import { ArrowRight } from 'lucide-react'

import { INCIDENT_PHASE_META } from '../../constants/incidents.js'
import { deriveIncidentPhases } from '../../utils/incidentPhases.js'

const PHASE_STYLE = {
  recon: 'border-sev-low/40 bg-sev-low/10 text-sev-low',
  exploit: 'border-sev-high/40 bg-sev-high/10 text-sev-high',
  impact: 'border-sev-critical/40 bg-sev-critical/10 text-sev-critical',
}

/**
 * Kill-chain phase summary derived from the incident's ordered alerts.
 * @param {{timeline: object[]}} props
 */
function IncidentPhaseSummary({ timeline = [] }) {
  const { sequence, summary, hasData } = deriveIncidentPhases(timeline)

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Phase summary</h2>
      {hasData ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {sequence.map((step, index) => (
            <span key={step.phase} className="flex items-center gap-2">
              {index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" /> : null}
              <span
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium ${
                  PHASE_STYLE[step.phase] ?? 'border-border text-muted'
                }`}
              >
                {INCIDENT_PHASE_META[step.phase]?.short ?? step.phase}
                <span className="tabular-nums opacity-80">{step.count}</span>
              </span>
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-2 text-xs text-muted">{summary}</p>
    </section>
  )
}

export default IncidentPhaseSummary
