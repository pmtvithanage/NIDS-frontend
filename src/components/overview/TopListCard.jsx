import { Link } from 'react-router-dom'

import ChartCard from '../common/ChartCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useTop } from '../../hooks/useStats.js'
import { OVERVIEW_TOP_LIMIT } from '../../constants/overview.js'
import { buildAlertsHref } from '../../utils/overview.js'

/**
 * Ranked list of alerts grouped by a dimension, each row deep-linking to the
 * matching filtered alerts list.
 * @param {{title: string, by: string, filter: (value: string) => object}} props
 */
function TopListCard({ title, by, filter }) {
  const query = useTop({ by, limit: OVERVIEW_TOP_LIMIT })
  const rows = query.data?.data ?? []
  const max = rows.reduce((peak, row) => Math.max(peak, row.count), 0)

  return (
    <ChartCard title={title} description={`Top ${OVERVIEW_TOP_LIMIT} in the full dataset.`}>
      {query.isLoading ? <LoadingSkeleton rows={OVERVIEW_TOP_LIMIT} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data && rows.length === 0 ? (
        <EmptyState title="No data" description="Nothing observed for this dimension." />
      ) : null}
      {rows.length > 0 ? (
        <ul className="space-y-1.5">
          {rows.map((row) => {
            const width = max ? Math.max((row.count / max) * 100, 4) : 0
            return (
              <li key={row.key}>
                <Link
                  to={buildAlertsHref(filter(row.key))}
                  className="block rounded px-1 py-1 hover:bg-surface-2"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-mono text-xs text-text" title={row.label}>
                      {row.label}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted">{row.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </ChartCard>
  )
}

export default TopListCard
