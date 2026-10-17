import { Link } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'
import { ANALYTICS_TOP_LIMIT } from '../../constants/analytics.js'

function TalkerList({ title, entries }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
      {entries.length === 0 ? (
        <p className="text-xs text-muted">No data</p>
      ) : (
        <ul className="space-y-0.5">
          {entries.slice(0, ANALYTICS_TOP_LIMIT).map((entry) => (
            <li key={entry.key}>
              <Link
                to={`/hosts/${entry.key}`}
                className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs hover:bg-surface-2"
              >
                <span className="truncate font-mono text-text">{entry.key}</span>
                <span className="tabular-nums text-muted">{entry.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Top source and destination IPs by alert count.
 * @param {{sources?: object[], destinations?: object[]}} props
 */
function TopTalkersTable({ sources = [], destinations = [] }) {
  if (sources.length === 0 && destinations.length === 0) {
    return <EmptyState title="No talkers" description="No IP activity was observed." />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TalkerList title="Top sources" entries={sources} />
      <TalkerList title="Top destinations" entries={destinations} />
    </div>
  )
}

export default TopTalkersTable
