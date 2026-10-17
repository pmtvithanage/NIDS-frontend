import { Link } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'

/**
 * Top attacking source IPs, with worst severity observed.
 * @param {{attackers?: Array<{ip: string, count: number, severity_tier: string}>}} props
 */
function ReportTopAttackers({ attackers = [] }) {
  if (attackers.length === 0) {
    return <EmptyState title="No attackers" description="No HIGH or CRITICAL source activity on this day." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Source IP</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Alerts</th>
            <th scope="col" className="py-2 font-medium">Worst severity</th>
          </tr>
        </thead>
        <tbody>
          {attackers.map((entry) => (
            <tr key={entry.ip} className="border-b border-border last:border-0">
              <td className="py-2 pr-3">
                <Link to={`/hosts/${entry.ip}`} className="font-mono text-xs text-text hover:text-accent">
                  {entry.ip}
                </Link>
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-muted">{entry.count}</td>
              <td className="py-2">
                <SeverityBadge tier={entry.severity_tier} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReportTopAttackers
