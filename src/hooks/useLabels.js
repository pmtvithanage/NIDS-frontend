import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { exportLabels, getLabelQueue, submitLabel, undoLabel } from '../api/labels.js'
import { queryKeys } from './queryKeys.js'

/** Labeling queue, most uncertain first. */
export function useLabelQueue() {
  return useQuery({
    queryKey: queryKeys.labelQueue(),
    queryFn: getLabelQueue,
    staleTime: 15_000,
  })
}

/**
 * Mutation: submit a human label with an optimistic detail-cache patch.
 */
export function useSubmitLabel() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ alertId, label, comment }) => submitLabel(alertId, label, comment),
    onMutate: async ({ alertId, label }) => {
      await client.cancelQueries({ queryKey: queryKeys.alertDetail(alertId) })
      const previousDetail = client.getQueryData(queryKeys.alertDetail(alertId))
      if (previousDetail) {
        client.setQueryData(queryKeys.alertDetail(alertId), (prev) => ({ ...prev, human_label: label }))
      }
      return { alertId, previousDetail }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        client.setQueryData(queryKeys.alertDetail(context.alertId), context.previousDetail)
      }
    },
    onSettled: (_data, _error, variables) => {
      client.invalidateQueries({ queryKey: queryKeys.labelQueue() })
      client.invalidateQueries({ queryKey: ['alerts'] })
      if (variables?.alertId) {
        client.invalidateQueries({ queryKey: queryKeys.alertDetail(variables.alertId) })
      }
    },
  })
}

/** Mutation: undo the most recent label for an alert. */
export function useUndoLabel() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (alertId) => undoLabel(alertId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.labelQueue() })
      client.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

/** Mutation: export labels as CSV. */
export function useExportLabels() {
  return useMutation({ mutationFn: () => exportLabels() })
}
