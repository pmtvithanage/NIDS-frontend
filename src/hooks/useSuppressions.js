import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSuppression,
  deleteSuppression,
  dryRunSuppression,
  getSuppressions,
  updateSuppression,
} from '../api/suppressions.js'
import { queryKeys } from './queryKeys.js'

/** List suppression rules. */
export function useSuppressions() {
  return useQuery({
    queryKey: queryKeys.suppressions(),
    queryFn: getSuppressions,
    staleTime: 30_000,
  })
}

/** Mutation: create a suppression rule. */
export function useCreateSuppression() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (rule) => createSuppression(rule),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.suppressions() })
      client.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

/** Mutation: update a suppression rule. */
export function useUpdateSuppression() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }) => updateSuppression(id, patch),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.suppressions() })
      client.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

/** Mutation: delete a suppression rule. */
export function useDeleteSuppression() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteSuppression(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.suppressions() }),
  })
}

/** Mutation: dry-run a rule. */
export function useDryRunSuppression() {
  return useMutation({ mutationFn: (rule) => dryRunSuppression(rule) })
}
