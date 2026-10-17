import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadMore from '../common/LoadMore.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import AlertsTable from './AlertsTable.jsx'

/**
 * Renders the alerts table plus its loading/error/empty and pagination states.
 * @param {{isLoading: boolean, isError: boolean, error?: object, onRetry?: () => void,
 *   rows: object[], columns: object[], sort: string, onSort: (field: string) => void,
 *   selectedIds: Set<string>, onToggleRow: Function, onToggleAll: Function,
 *   onOpen: (id: string) => void, onQuickAction: Function, focusIndex: number,
 *   hasNextPage: boolean, isFetchingNextPage: boolean, onLoadMore: () => void,
 *   total: number}} props
 */
function AlertsResults({
  isLoading,
  isError,
  error,
  onRetry,
  rows,
  columns,
  sort,
  onSort,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onOpen,
  onQuickAction,
  focusIndex,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  total,
}) {
  if (isLoading) return <LoadingSkeleton rows={8} className="px-1 py-2" />
  if (isError) return <ErrorState error={error} onRetry={onRetry} />
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No alerts match these filters"
        description="Try widening the time range or clearing a few filters."
      />
    )
  }

  return (
    <div className="space-y-3">
      <AlertsTable
        rows={rows}
        columns={columns}
        sort={sort}
        onSort={onSort}
        selectedIds={selectedIds}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
        onOpen={onOpen}
        onQuickAction={onQuickAction}
        focusIndex={focusIndex}
      />
      <LoadMore
        meta={{ total, has_more: hasNextPage }}
        count={rows.length}
        onLoadMore={onLoadMore}
        loading={isFetchingNextPage}
      />
    </div>
  )
}

export default AlertsResults
