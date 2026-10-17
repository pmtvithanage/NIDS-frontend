import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Undo2 } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import LabelQueueCard from '../components/labeling/LabelQueueCard.jsx'
import { LABEL_KEY_MAP, SKIP_KEY, UPCOMING_LIMIT } from '../constants/labeling.js'
import { useExportLabels, useLabelQueue, useSubmitLabel, useUndoLabel } from '../hooks/useLabels.js'
import { useToast } from '../hooks/useToast.js'
import { downloadCsv } from '../utils/csv.js'

/** Uncertain-first labeling queue with one-key labeling, undo and CSV export. */
function Labeling() {
  const { toast } = useToast()
  const query = useLabelQueue()
  const submitLabel = useSubmitLabel()
  const undoLabel = useUndoLabel()
  const exportLabels = useExportLabels()

  const [handled, setHandled] = useState(() => new Set())
  const [skipped, setSkipped] = useState(() => new Set())
  const [history, setHistory] = useState([])

  const items = useMemo(() => query.data?.data ?? [], [query.data])
  const visible = useMemo(
    () => items.filter((item) => !handled.has(item.id) && !skipped.has(item.id)),
    [items, handled, skipped],
  )
  const current = visible[0]
  const upcoming = visible.slice(1, 1 + UPCOMING_LIMIT)
  const total = history.length + skipped.size + visible.length

  const handleLabel = useCallback(
    async (label) => {
      if (!current) return
      const alertId = current.id
      setHandled((prev) => new Set(prev).add(alertId))
      setHistory((prev) => [...prev, { alertId, label }])
      try {
        await submitLabel.mutateAsync({ alertId, label })
        toast(`Labeled ${alertId} as ${label}`, { variant: 'success' })
      } catch (error) {
        setHandled((prev) => {
          const next = new Set(prev)
          next.delete(alertId)
          return next
        })
        setHistory((prev) => prev.filter((entry) => entry.alertId !== alertId))
        toast(error?.message ?? 'Could not submit label', { variant: 'error' })
      }
    },
    [current, submitLabel, toast],
  )

  const handleSkip = useCallback(() => {
    if (!current) return
    setSkipped((prev) => new Set(prev).add(current.id))
  }, [current])

  const handleUndo = useCallback(async () => {
    const last = history[history.length - 1]
    if (!last) return
    setHistory((prev) => prev.slice(0, -1))
    setHandled((prev) => {
      const next = new Set(prev)
      next.delete(last.alertId)
      return next
    })
    try {
      await undoLabel.mutateAsync(last.alertId)
      toast(`Undid label on ${last.alertId}`, { variant: 'info' })
    } catch (error) {
      setHandled((prev) => new Set(prev).add(last.alertId))
      setHistory((prev) => [...prev, last])
      toast(error?.message ?? 'Could not undo label', { variant: 'error' })
    }
  }, [history, undoLabel, toast])

  useEffect(() => {
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return
      const key = event.key.toLowerCase()
      if (LABEL_KEY_MAP[key]) {
        event.preventDefault()
        handleLabel(LABEL_KEY_MAP[key])
      } else if (key === SKIP_KEY) {
        event.preventDefault()
        handleSkip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleLabel, handleSkip])

  const handleExport = useCallback(async () => {
    try {
      const csv = await exportLabels.mutateAsync()
      downloadCsv(`labeled-dataset-${new Date().toISOString().slice(0, 10)}.csv`, csv)
      toast('Export ready', { variant: 'success' })
    } catch (error) {
      toast(error?.message ?? 'Export failed', { variant: 'error' })
    }
  }, [exportLabels, toast])

  const pct = total ? Math.round((history.length / total) * 100) : 0

  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-text">Labeling queue</h1>
          <p className="text-xs text-muted">
            {history.length} labeled &middot; {visible.length} remaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0 || undoLabel.isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            Undo last label
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLabels.isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
          >
            {exportLabels.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Export labeled dataset (CSV)
          </button>
        </div>
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>

      {query.isLoading ? <LoadingSkeleton rows={6} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {!query.isLoading && !query.isError && !current ? (
        <EmptyState
          title="Queue cleared"
          description="Every flow in the uncertainty window has been labeled. New high-uncertainty flows will appear here."
        />
      ) : null}

      {current ? (
        <>
          <LabelQueueCard
            item={current}
            onLabel={handleLabel}
            onSkip={handleSkip}
            busy={submitLabel.isPending}
          />
          {upcoming.length > 0 ? (
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Up next</p>
              <ul className="space-y-1">
                {upcoming.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span className="font-mono">{item.id}</span>
                    <span className="truncate">{item.mlp_label}</span>
                    <span className="tabular-nums">{Math.round(item.mlp_confidence * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default Labeling
