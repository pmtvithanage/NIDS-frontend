import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  bulkUpdateAlerts,
  exportAlerts,
  getAlert,
  getAlertDetail,
  getAlertExplain,
  getAlertPcapHint,
  getAlerts,
  updateAlert,
} from '../api/alerts.js'
import { queryKeys } from './queryKeys.js'

const ALERTS_STALE = 15_000

/**
 * Query the alerts list.
 * @param {object} params Filter/sort/pagination params.
 */
export function useAlerts(params) {
  return useQuery({
    queryKey: queryKeys.alerts(params),
    queryFn: () => getAlerts(params),
    staleTime: ALERTS_STALE,
  })
}

/**
 * Cursor-paginated alerts list for the virtualized table.
 * @param {object} params Filter/sort params (without cursor).
 * @param {{enabled?: boolean}} [options]
 */
export function useInfiniteAlerts(params, options = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.alerts(params),
    queryFn: ({ pageParam }) => getAlerts({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.meta?.next_cursor ?? undefined,
    staleTime: ALERTS_STALE,
    enabled: options.enabled ?? true,
  })
}

/** Mutation: export the filtered view as CSV text. */
export function useExportAlerts() {
  return useMutation({ mutationFn: (params) => exportAlerts(params) })
}

/**
 * Query a single alert.
 * @param {string} id Alert id.
 * @param {{enabled?: boolean}} [options]
 */
export function useAlert(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.alert(id),
    queryFn: () => getAlert(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: ALERTS_STALE,
  })
}

/**
 * Query the full detail object for an alert.
 * @param {string} id Alert id.
 */
export function useAlertDetail(id) {
  return useQuery({
    queryKey: queryKeys.alertDetail(id),
    queryFn: () => getAlertDetail(id),
    enabled: Boolean(id),
    staleTime: ALERTS_STALE,
  })
}

/**
 * Query the explainability block (top anomalous features) for an alert.
 * @param {string} id Alert id.
 */
export function useAlertExplain(id) {
  return useQuery({
    queryKey: queryKeys.alertExplain(id),
    queryFn: () => getAlertExplain(id),
    enabled: Boolean(id),
    staleTime: ALERTS_STALE,
  })
}

/**
 * Query the capture window + BPF filter hint for an alert.
 * @param {string} id Alert id.
 */
export function useAlertPcapHint(id) {
  return useQuery({
    queryKey: queryKeys.alertPcapHint(id),
    queryFn: () => getAlertPcapHint(id),
    enabled: Boolean(id),
    staleTime: ALERTS_STALE,
  })
}

/**
 * Mutation: update one alert with optimistic cache patching.
 * Patches both the alert and its detail cache immediately and rolls back on
 * error, then reconciles with the server.
 */
export function useUpdateAlert() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }) => updateAlert(id, patch),
    onMutate: async ({ id, patch }) => {
      await client.cancelQueries({ queryKey: queryKeys.alert(id) })
      await client.cancelQueries({ queryKey: queryKeys.alertDetail(id) })
      const previousAlert = client.getQueryData(queryKeys.alert(id))
      const previousDetail = client.getQueryData(queryKeys.alertDetail(id))
      if (previousAlert) {
        client.setQueryData(queryKeys.alert(id), (prev) => ({ ...prev, ...patch }))
      }
      if (previousDetail) {
        client.setQueryData(queryKeys.alertDetail(id), (prev) => ({ ...prev, ...patch }))
      }
      return { id, previousAlert, previousDetail }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      if (context.previousAlert) client.setQueryData(queryKeys.alert(context.id), context.previousAlert)
      if (context.previousDetail) {
        client.setQueryData(queryKeys.alertDetail(context.id), context.previousDetail)
      }
    },
    onSettled: (_data, _error, variables) => {
      client.invalidateQueries({ queryKey: ['alerts'] })
      client.invalidateQueries({ queryKey: queryKeys.alert(variables.id) })
      client.invalidateQueries({ queryKey: queryKeys.alertDetail(variables.id) })
    },
  })
}

/** Mutation: bulk update alerts. */
export function useBulkUpdateAlerts() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, patch }) => bulkUpdateAlerts(ids, patch),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
