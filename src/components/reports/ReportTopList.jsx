import EmptyState from '../common/EmptyState.jsx'

/**
 * Generic ranked list: label + count.
 * @param {{title?: string, items?: Array<{key: string, count: number}>}} props
 */
function ReportTopList({ title, items = [] }) {
  if (items.length === 0) {
    return <EmptyState title="No entries" description={`No ${title?.toLowerCase() ?? 'data'} recorded.`} />
  }

  return (
    <ol className="space-y-1">
      {items.map((entry, index) => (
        <li key={entry.key} className="flex items-center gap-2 text-sm">
          <span className="w-5 shrink-0 tabular-nums text-xs text-muted">{index + 1}.</span>
          <span className="min-w-0 flex-1 truncate text-text" title={entry.key}>
            {entry.key}
          </span>
          <span className="tabular-nums text-muted">{entry.count}</span>
        </li>
      ))}
    </ol>
  )
}

export default ReportTopList
