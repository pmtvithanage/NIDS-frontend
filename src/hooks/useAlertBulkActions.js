import { useCallback, useState } from 'react'

import { useBulkUpdateAlerts } from './useAlerts.js'
import { useCreateSuppression } from './useSuppressions.js'
import { useToast } from './useToast.js'

function groupBySignature(alerts) {
  const groups = new Map()
  for (const alert of alerts) {
    const signatureId = alert.suricata?.signature_id
    if (signatureId == null) continue
    if (!groups.has(signatureId)) {
      groups.set(signatureId, { signatureId, signature: alert.suricata.signature, count: 0 })
    }
    groups.get(signatureId).count += 1
  }
  return [...groups.values()]
}

/**
 * Bulk operations for the selected alerts (status, assign, label, suppress).
 * @param {{selectedAlerts: object[], clearSelection: () => void}} options
 * @returns {{busy: boolean, setStatus: Function, assign: Function,
 *   label: Function, suppress: Function}}
 */
export function useAlertBulkActions({ selectedAlerts, clearSelection }) {
  const bulk = useBulkUpdateAlerts()
  const createSuppression = useCreateSuppression()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (task, successMessage) => {
      setBusy(true)
      try {
        await task()
        toast(successMessage, { variant: 'success' })
        clearSelection()
      } catch (error) {
        toast(error?.message ?? 'Bulk action failed', { variant: 'error' })
      } finally {
        setBusy(false)
      }
    },
    [toast, clearSelection],
  )

  const setStatus = useCallback(
    (status) =>
      run(
        () => bulk.mutateAsync({ ids: selectedAlerts.map((a) => a.id), patch: { status } }),
        `Updated ${selectedAlerts.length} alert(s)`,
      ),
    [run, bulk, selectedAlerts],
  )

  const assign = useCallback(
    (assignee) =>
      run(
        () => bulk.mutateAsync({ ids: selectedAlerts.map((a) => a.id), patch: { assignee } }),
        `Assigned ${selectedAlerts.length} alert(s)`,
      ),
    [run, bulk, selectedAlerts],
  )

  const label = useCallback(
    (humanLabel) =>
      run(
        () =>
          bulk.mutateAsync({
            ids: selectedAlerts.map((a) => a.id),
            patch: { human_label: humanLabel },
          }),
        `Labeled ${selectedAlerts.length} alert(s)`,
      ),
    [run, bulk, selectedAlerts],
  )

  const suppress = useCallback(() => {
    const groups = groupBySignature(selectedAlerts)
    if (groups.length === 0) {
      toast('Selected alerts have no signature to suppress', { variant: 'warning' })
      return Promise.resolve()
    }
    return run(
      () =>
        Promise.all(
          groups.map((group) =>
            createSuppression.mutateAsync({
              name: `Bulk suppress: ${group.signature}`,
              reason: 'Created from the alerts list',
              enabled: true,
              match: { signature_id: group.signatureId },
            }),
          ),
        ),
      `Created ${groups.length} suppression rule(s)`,
    )
  }, [run, createSuppression, selectedAlerts, toast])

  return { busy, setStatus, assign, label, suppress }
}
