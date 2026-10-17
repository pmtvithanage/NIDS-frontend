import { useState } from 'react'
import { Plus } from 'lucide-react'

import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import SuppressionRuleDialog from '../components/suppressions/SuppressionRuleDialog.jsx'
import SuppressionsTable from '../components/suppressions/SuppressionsTable.jsx'
import { useDeleteSuppression, useSuppressions } from '../hooks/useSuppressions.js'
import { useToast } from '../hooks/useToast.js'

/** Manage suppression rules that hide matching alerts from the feed. */
function Suppressions() {
  const { toast } = useToast()
  const query = useSuppressions()
  const deleteSuppression = useDeleteSuppression()
  const [dialog, setDialog] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const rules = query.data?.data ?? []

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteSuppression.mutateAsync(pendingDelete.id)
      toast(`Deleted "${pendingDelete.name}"`, { variant: 'success' })
      setPendingDelete(null)
    } catch (error) {
      toast(error?.message ?? 'Could not delete rule', { variant: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-text">Suppressions</h1>
          <p className="text-xs text-muted">
            Rules that hide known-noise alerts. Change history is kept for auditing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ rule: null })}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New rule
        </button>
      </header>

      {query.isLoading ? <LoadingSkeleton rows={6} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {!query.isLoading && !query.isError && rules.length === 0 ? (
        <EmptyState title="No suppression rules" description="Create a rule to hide known-noise alerts." />
      ) : null}
      {rules.length > 0 ? (
        <SuppressionsTable
          data={rules}
          onEdit={(rule) => setDialog({ rule })}
          onDelete={(rule) => setPendingDelete(rule)}
        />
      ) : null}

      {dialog ? (
        <SuppressionRuleDialog
          rule={dialog.rule}
          onClose={() => setDialog(null)}
          onSaved={() => query.refetch()}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete suppression rule?"
        description={pendingDelete ? `"${pendingDelete.name}" will stop hiding matching alerts.` : ''}
        confirmLabel="Delete"
        busy={deleteSuppression.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

export default Suppressions
