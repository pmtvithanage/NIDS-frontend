import { useCallback, useState } from 'react'

import { useUpdateAlert } from './useAlerts.js'
import { useSubmitLabel } from './useLabels.js'
import { useCreateSuppression, useDryRunSuppression } from './useSuppressions.js'
import { useToast } from './useToast.js'

/**
 * Build a default suppression rule that matches an alert's Suricata signature.
 * @param {object} alert Alert detail object.
 * @returns {object} Suppression rule payload.
 */
export function buildSuppressionRule(alert) {
  return {
    name: `Ignore ${alert.suricata.signature}`,
    reason: `Suppress ${alert.suricata.category} signature (from ${alert.id}).`,
    enabled: true,
    match: { signature_id: alert.suricata.signature_id },
  }
}

/**
 * Dialog state and mutations backing the alert detail analyst actions.
 * @param {string} id Alert id.
 * @param {object|undefined} detail Alert detail object.
 */
export function useAlertDetailActions(id, detail) {
  const { toast } = useToast()
  const [labelOpen, setLabelOpen] = useState(false)
  const [suppressOpen, setSuppressOpen] = useState(false)

  const updateAlert = useUpdateAlert()
  const submitLabelMutation = useSubmitLabel()
  const createSuppression = useCreateSuppression()
  const dryRun = useDryRunSuppression()

  const runPatch = useCallback(
    async (patch, message) => {
      try {
        await updateAlert.mutateAsync({ id, patch })
        toast(message, { variant: 'success' })
      } catch (error) {
        toast(error?.message ?? 'Update failed', { variant: 'error' })
      }
    },
    [id, updateAlert, toast],
  )

  const openSuppress = useCallback(() => {
    if (!detail) return
    dryRun.reset()
    dryRun.mutate({ match: { signature_id: detail.suricata.signature_id } })
    setSuppressOpen(true)
  }, [detail, dryRun])

  const createRule = useCallback(
    async (rule, message) => {
      try {
        await createSuppression.mutateAsync(rule)
        toast(message, { variant: 'success' })
        setSuppressOpen(false)
      } catch (error) {
        toast(error?.message ?? 'Could not create suppression', { variant: 'error' })
      }
    },
    [createSuppression, toast],
  )

  const submitLabel = useCallback(
    async ({ label, comment }) => {
      try {
        await submitLabelMutation.mutateAsync({ alertId: id, label, comment })
        toast(`Labeled as ${label}`, { variant: 'success' })
        setLabelOpen(false)
      } catch (error) {
        toast(error?.message ?? 'Could not submit label', { variant: 'error' })
      }
    },
    [submitLabelMutation, id, toast],
  )

  return {
    labelOpen,
    suppressOpen,
    openLabel: useCallback(() => setLabelOpen(true), []),
    closeLabel: useCallback(() => setLabelOpen(false), []),
    openSuppress,
    closeSuppress: useCallback(() => setSuppressOpen(false), []),
    setStatus: useCallback((status) => runPatch({ status }, 'Status updated'), [runPatch]),
    setAssignee: useCallback(
      (assignee) => runPatch({ assignee }, assignee ? `Assigned to ${assignee}` : 'Unassigned'),
      [runPatch],
    ),
    saveNotes: useCallback((notes) => runPatch({ notes }, 'Notes saved'), [runPatch]),
    submitLabel,
    createRule,
    patchBusy: updateAlert.isPending,
    labelBusy: submitLabelMutation.isPending,
    suppressBusy: createSuppression.isPending,
    dryRun,
  }
}
