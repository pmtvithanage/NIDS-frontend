import { Link } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'

/**
 * Incident IDs referenced during the report day.
 * @param {{incidentIds?: string[]}} props
 */
function ReportIncidents({ incidentIds = [] }) {
  if (incidentIds.length === 0) {
    return <EmptyState title="No incidents" description="No correlated incidents on this day." />
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {incidentIds.map((id) => (
        <li key={id}>
          <Link
            to={`/incidents/${id}`}
            className="inline-flex rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-xs text-text hover:border-accent hover:text-accent"
          >
            {id}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default ReportIncidents
