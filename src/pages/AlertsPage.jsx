import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Keyboard } from 'lucide-react'

import { alertColumns } from '../components/alerts/alertColumns.jsx'
import AlertFilters from '../components/alerts/AlertFilters.jsx'
import AlertsResults from '../components/alerts/AlertsResults.jsx'
import BulkActionBar from '../components/alerts/BulkActionBar.jsx'
import KeyboardHelp from '../components/alerts/KeyboardHelp.jsx'
import NewAlertsBanner from '../components/alerts/NewAlertsBanner.jsx'
import { ALERT_FILTER_DEFAULTS, ALERT_PAGE_SIZE } from '../constants/alerts.js'
import { useAlertBulkActions } from '../hooks/useAlertBulkActions.js'
import { useAlertSelection } from '../hooks/useAlertSelection.js'
import { useAlertsKeyboard } from '../hooks/useAlertsKeyboard.js'
import { useAlertsLive } from '../hooks/useAlertsLive.js'
import { useExportAlerts, useInfiniteAlerts, useUpdateAlert } from '../hooks/useAlerts.js'
import { useFilterPresets } from '../hooks/useFilterPresets.js'
import { useTimeWindow } from '../hooks/useTimeWindow.js'
import { useToast } from '../hooks/useToast.js'
import { useUrlState } from '../hooks/useUrlState.js'
import { downloadCsv } from '../utils/csv.js'

const STATUS_PATCH = { acknowledge: 'acknowledged', false_positive: 'false_positive' }

/** Alerts list page: filters, virtualized table, live feed and bulk actions. */
function AlertsPage() {
  const [filters, setFilters, resetFilters] = useUrlState(ALERT_FILTER_DEFAULTS)
  const [focusIndex, setFocusIndex] = useState(-1)
  const [helpOpen, setHelpOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const window = useTimeWindow(filters.range, filters.from, filters.to)
  const params = useMemo(
    () => ({
      ...filters,
      limit: Number(filters.limit) || ALERT_PAGE_SIZE,
      from: window.from ?? undefined,
      to: window.to ?? undefined,
    }),
    [filters, window],
  )

  const query = useInfiniteAlerts(params)
  const rows = useMemo(() => (query.data?.pages ?? []).flatMap((page) => page.data), [query.data])
  const total = query.data?.pages?.[0]?.meta?.total ?? rows.length

  const selection = useAlertSelection()
  const selectedAlerts = useMemo(
    () => rows.filter((row) => selection.selectedIds.has(row.id)),
    [rows, selection.selectedIds],
  )
  const bulk = useAlertBulkActions({ selectedAlerts, clearSelection: selection.clear })
  const updateAlert = useUpdateAlert()
  const exportAlerts = useExportAlerts()
  const live = useAlertsLive()
  const { presets, savePreset, removePreset } = useFilterPresets()

  const clampedFocusIndex = useMemo(
    () => (rows.length > 0 && focusIndex >= rows.length ? rows.length - 1 : focusIndex),
    [focusIndex, rows.length],
  )

  const handleSort = useCallback(
    (field) => {
      const [current, dir] = filters.sort.split(':')
      const nextDir = current === field && dir === 'desc' ? 'asc' : 'desc'
      setFilters({ sort: `${field}:${nextDir}` })
    },
    [filters.sort, setFilters],
  )

  const handleOpen = useCallback(
    (id) => {
      const alertIds = rows.map((row) => row.id)
      const index = alertIds.indexOf(id)
      navigate(`/alerts/${id}`, {
        state: {
          alertIds,
          index,
          search: location.search.replace(/^\?/, ''),
        },
      })
    },
    [navigate, rows, location.search],
  )

  const handleQuickAction = useCallback(
    async (action, id) => {
      try {
        await updateAlert.mutateAsync({ id, patch: { status: STATUS_PATCH[action] } })
        toast(action === 'acknowledge' ? 'Alert acknowledged' : 'Marked false positive', {
          variant: 'success',
        })
      } catch (error) {
        toast(error?.message ?? 'Failed to update alert', { variant: 'error' })
      }
    },
    [updateAlert, toast],
  )

  const moveFocus = useCallback(
    (delta) => {
      setFocusIndex((index) => {
        const base = index < 0 ? (delta > 0 ? -1 : rows.length) : index
        return Math.max(0, Math.min(rows.length - 1, base + delta))
      })
    },
    [rows.length],
  )

  const openFocused = useCallback(() => {
    if (rows[clampedFocusIndex]) handleOpen(rows[clampedFocusIndex].id)
  }, [rows, clampedFocusIndex, handleOpen])

  const quickFocused = useCallback(
    (action) => {
      if (rows[clampedFocusIndex]) handleQuickAction(action, rows[clampedFocusIndex].id)
    },
    [rows, clampedFocusIndex, handleQuickAction],
  )

  useAlertsKeyboard({
    onMove: moveFocus,
    onOpen: openFocused,
    onAcknowledge: () => quickFocused('acknowledge'),
    onFalsePositive: () => quickFocused('false_positive'),
    onHelp: () => setHelpOpen((open) => !open),
    onFocusSearch: () => document.getElementById('alert-search')?.focus(),
  })

  const flushPending = useCallback(() => {
    live.clear()
    queryClient.resetQueries({ queryKey: ['alerts'] })
  }, [live, queryClient])

  const handleExport = useCallback(async () => {
    try {
      const csv = await exportAlerts.mutateAsync({ ...params })
      downloadCsv(`alerts-${new Date().toISOString().slice(0, 10)}.csv`, csv)
      toast('Export ready', { variant: 'success' })
    } catch (error) {
      toast(error?.message ?? 'Export failed', { variant: 'error' })
    }
  }, [exportAlerts, params, toast])

  const handleSavePreset = useCallback(
    (name) => {
      savePreset(name, filters)
      toast(`Saved preset "${name}"`, { variant: 'success' })
    },
    [savePreset, filters, toast],
  )

  const handleApplyPreset = useCallback(
    (presetFilters) => {
      setFilters(presetFilters)
      toast('Preset applied', { variant: 'info' })
    },
    [setFilters, toast],
  )

  const handleRemovePreset = useCallback(
    (name) => {
      removePreset(name)
      toast('Preset removed', { variant: 'info' })
    },
    [removePreset, toast],
  )

  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-text">Alerts</h1>
          <p className="text-xs text-muted">
            {total} alert{total === 1 ? '' : 's'} in range
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2"
        >
          <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          Shortcuts (?)
        </button>
      </header>

      <AlertFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        presets={presets}
        onSavePreset={handleSavePreset}
        onApplyPreset={handleApplyPreset}
        onRemovePreset={handleRemovePreset}
        onExport={handleExport}
        exporting={exportAlerts.isPending}
      />

      <NewAlertsBanner
        count={live.pendingCount}
        paused={live.paused}
        onShow={flushPending}
        onTogglePause={live.togglePause}
      />

      <AlertsResults
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        rows={rows}
        columns={alertColumns}
        sort={filters.sort}
        onSort={handleSort}
        selectedIds={selection.selectedIds}
        onToggleRow={selection.toggle}
        onToggleAll={(checked) => selection.setMany(rows.map((row) => row.id), checked)}
        onOpen={handleOpen}
        onQuickAction={handleQuickAction}
        focusIndex={clampedFocusIndex}
        hasNextPage={Boolean(query.hasNextPage)}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={query.fetchNextPage}
        total={total}
      />

      <BulkActionBar
        count={selection.count}
        busy={bulk.busy}
        onClear={selection.clear}
        onSetStatus={bulk.setStatus}
        onAssign={bulk.assign}
        onLabel={bulk.label}
        onSuppress={bulk.suppress}
      />

      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

export default AlertsPage
