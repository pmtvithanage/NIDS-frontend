import { Link } from 'react-router-dom'

import SeverityBadge from '../common/SeverityBadge.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import { formatTs } from '../../utils/format.js'

/**
 * Incidents table: id/title, max severity, alert count, first/last seen, status.
 * @param {{incidents: object[]}} props
 */
function IncidentsTable({ incidents }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-3 py-2 font-medium">Incident</th>
            <th scope="col" className="px-3 py-2 font-medium">Max severity</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Alerts</th>
            <th scope="col" className="px-3 py-2 font-medium">First seen</th>
            <th scope="col" className="px-3 py-2 font-medium">Last seen</th>
            <th scope="col" className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
              <td className="max-w-md px-3 py-2">
                <Link to={`/incidents/${incident.id}`} className="block min-w-0">
                  <span className="font-mono text-xs text-accent">{incident.id}</span>
                  <span className="mt-0.5 block truncate text-xs text-text" title={incident.title}>
                    {incident.title}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-2">
                <SeverityBadge tier={incident.severity_tier} />
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-text">{incident.alert_count}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-muted">
                {formatTs(incident.first_seen)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-muted">
                {formatTs(incident.last_seen)}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={incident.status} kind="incident" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default IncidentsTable
