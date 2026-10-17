import { Link } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { formatTs } from '../../utils/format.js'

/**
 * Related alerts (same host/signature within the correlation window).
 * @param {{alerts?: object[]}} props
 */
function RelatedAlerts({ alerts = [] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-text">Related alerts</h2>
      {alerts.length === 0 ? (
        <EmptyState
          title="No related alerts"
          description="Nothing else matched this host or signature nearby."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <Link
                to={`/alerts/${alert.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-surface-2"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <SeverityBadge tier={alert.severity_tier} />
                    <span className="font-mono text-xs text-text">{alert.id}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted" title={alert.signature}>
                    {alert.mlp_label}
                    {alert.signature ? ` · ${alert.signature}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted">{formatTs(alert.ts)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RelatedAlerts
