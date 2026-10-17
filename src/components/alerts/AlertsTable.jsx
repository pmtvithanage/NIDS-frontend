import { useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { tableFeatures, useTable } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { ALERT_GRID_TEMPLATE } from './alertColumns.jsx'
import AlertRow from './AlertRow.jsx'
import { ALERT_ROW_HEIGHT } from '../../constants/alerts.js'

const features = tableFeatures({})

function parseSort(sort) {
  const [field, dir] = String(sort || '').split(':')
  return { field, dir: dir === 'asc' ? 'asc' : 'desc' }
}

/**
 * Sortable, virtualized alerts table built on TanStack Table.
 * @param {{rows: object[], columns: object[], sort: string, onSort: (field: string) => void,
 *   selectedIds: Set<string>, onToggleRow: (id: string, checked: boolean) => void,
 *   onToggleAll: (checked: boolean) => void, onOpen: (id: string) => void,
 *   onQuickAction: (action: string, id: string) => void, focusIndex: number}} props
 */
function AlertsTable({
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
}) {
  const scrollRef = useRef(null)
  const table = useTable({ features, columns, data: rows, getRowId: (row) => row.id })
  const { field: sortField, dir: sortDir } = parseSort(sort)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ALERT_ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => rows[index]?.id ?? index,
  })

  useEffect(() => {
    if (focusIndex >= 0 && focusIndex < rows.length) {
      virtualizer.scrollToIndex(focusIndex, { align: 'auto' })
    }
  }, [focusIndex, rows.length, virtualizer])

  const headerGroup = table.getHeaderGroups()[0]
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id))
  const someSelected = rows.some((row) => selectedIds.has(row.id))
  const template = useMemo(() => ALERT_GRID_TEMPLATE, [])
  const items = virtualizer.getVirtualItems()

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div
        ref={scrollRef}
        className="max-h-[calc(100vh-21rem)] overflow-auto"
        role="table"
        aria-rowcount={rows.length}
        aria-label="Alerts"
      >
        <div
          role="rowgroup"
          className="sticky top-0 z-10 border-b border-border bg-surface-2"
          style={{ display: 'grid', gridTemplateColumns: template }}
        >
          <div role="columnheader" className="flex items-center justify-center py-2">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(node) => {
                if (node) node.indeterminate = !allSelected && someSelected
              }}
              onChange={(event) => onToggleAll(event.target.checked)}
              aria-label="Select all loaded alerts"
              className="h-3.5 w-3.5 accent-[var(--accent)]"
            />
          </div>
          {headerGroup.headers.map((header) => {
            const meta = header.column.columnDef.meta ?? {}
            const active = meta.sortable && meta.sortField === sortField
            return (
              <div key={header.id} role="columnheader" className="min-w-0 px-2 py-2">
                {meta.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort(meta.sortField)}
                    className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted hover:text-text"
                  >
                    <table.FlexRender header={header} />
                    {active ? (
                      sortDir === 'asc' ? (
                        <ChevronUp className="h-3 w-3 text-accent" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-accent" aria-hidden="true" />
                      )
                    ) : null}
                  </button>
                ) : (
                  <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    <table.FlexRender header={header} />
                  </span>
                )}
              </div>
            )
          })}
          <div role="columnheader" aria-label="Row actions" className="py-2" />
        </div>

        <div role="rowgroup" style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {items.map((item) => {
            const row = table.getRowModel().rows[item.index]
            if (!row) return null
            return (
              <AlertRow
                key={row.id}
                table={table}
                row={row}
                template={template}
                top={item.start}
                selected={selectedIds.has(row.original.id)}
                focused={item.index === focusIndex}
                onToggle={onToggleRow}
                onOpen={onOpen}
                onQuickAction={onQuickAction}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AlertsTable
