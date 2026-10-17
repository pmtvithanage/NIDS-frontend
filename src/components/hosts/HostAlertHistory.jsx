import { Link } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { formatTs } from '../../utils/format.js'

/**
 * Table of alerts involving a host, most recent first.
 * @param {{history?: object[]}} props
 */
function HostAlertHistory({ history = [] }) {
  if (history.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Alert history</h2>
        <EmptyState title="No alerts" description="This host has no recorded alerts." />
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-surface">
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-text">Alert history</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th scope="col" className="px-3 py-2 font-medium">Alert</th>
              <th scope="col" className="px-3 py-2 font-medium">Time</th>
              <th scope="col" className="px-3 py-2 font-medium">Severity</th>
              <th scope="col" className="px-3 py-2 font-medium">Label</th>
              <th scope="col" className="px-3 py-2 font-medium">Signature</th>
              <th scope="col" className="px-3 py-2 font-medium">Direction</th>
            </tr>
          </thead>
          <tbody>
            {history.map((alert) => (
              <tr key={alert.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                <td className="px-3 py-2">
                  <Link to={`/alerts/${alert.id}`} className="font-mono text-xs text-accent hover:underline">
                    {alert.id}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-muted">
                  {formatTs(alert.ts)}
                </td>
                <td className="px-3 py-2">
                  <SeverityBadge tier={alert.severity_tier} />
                </td>
                <td className="px-3 py-2 text-xs text-text">{alert.mlp_label}</td>
                <td className="max-w-sm truncate px-3 py-2 text-xs text-muted" title={alert.signature}>
                  {alert.signature}
                </td>
                <td className="px-3 py-2 text-xs text-muted">{alert.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default HostAlertHistory
