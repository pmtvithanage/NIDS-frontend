import { Link } from 'react-router-dom'
import { AlertTriangle, Layers, ShieldQuestion } from 'lucide-react'

import EmptyState from '../common/EmptyState.jsx'
import KpiTile from '../common/KpiTile.jsx'
import { ENGINE_LABELS } from '../../constants/models.js'

function formatShare(share) {
  return `${Math.round((share ?? 0) * 1000) / 10}%`
}

/**
 * Fusion review: how often CRITICAL rested on a single (weak) engine.
 * @param {{review?: object}} props
 */
function FusionReviewPanel({ review }) {
  if (!review || review.critical_total === 0) {
    return <EmptyState title="No CRITICAL alerts" description="Nothing to review for fusion single-engine reliance." />
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiTile label="CRITICAL alerts" value={review.critical_total} icon={Layers} />
        <KpiTile
          label="Single-engine"
          value={review.single_engine}
          hint={`${formatShare(review.single_engine_share)} of CRITICAL`}
          icon={ShieldQuestion}
        />
        <KpiTile
          label="Single weak engine"
          value={review.single_weak}
          hint={`${formatShare(review.single_weak_share)} of CRITICAL`}
          icon={AlertTriangle}
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Lone driver engine</p>
        <ul className="space-y-1">
          {review.by_engine.map((entry) => (
            <li key={entry.engine} className="flex items-center justify-between text-xs">
              <span className="text-text">{ENGINE_LABELS[entry.engine] ?? entry.engine}</span>
              <span className="tabular-nums text-muted">{entry.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {review.examples.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Examples</p>
          <ul className="space-y-0.5">
            {review.examples.map((example) => (
              <li key={example.id}>
                <Link to={`/alerts/${example.id}`} className="flex items-center justify-between rounded px-1.5 py-1 text-xs hover:bg-surface-2">
                  <span className="font-mono text-text">{example.id}</span>
                  <span className="text-muted">{ENGINE_LABELS[example.engine] ?? example.engine}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default FusionReviewPanel
