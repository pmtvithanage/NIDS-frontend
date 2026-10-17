import { Link } from 'react-router-dom'

import SeverityBadge from '../common/SeverityBadge.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import { formatTs } from '../../utils/format.js'

/**
 * Vertical timeline of the alerts that make up an incident.
 * @param {{timeline: object[]}} props
 */
function IncidentTimeline({ timeline = [] }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Alert timeline</h2>
      <ol className="mt-3 space-y-0">
        {timeline.map((entry, index) => (
          <li key={entry.alert_id} className="relative flex gap-3 pb-4 last:pb-0">
            <span className="relative flex w-4 shrink-0 justify-center">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
              {index < timeline.length - 1 ? (
                <span className="absolute top-4 h-full w-px bg-border" aria-hidden="true" />
              ) : null}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/alerts/${entry.alert_id}`} className="font-mono text-xs text-accent hover:underline">
                  {entry.alert_id}
                </Link>
                <SeverityBadge tier={entry.severity_tier} />
                <StatusBadge status={entry.status} />
                <span className="text-xs tabular-nums text-muted">{formatTs(entry.ts)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-text" title={entry.summary}>
                {entry.mlp_label} &middot; {entry.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default IncidentTimeline
