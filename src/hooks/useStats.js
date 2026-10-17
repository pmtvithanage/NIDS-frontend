import { useQuery } from '@tanstack/react-query'

import {
  getEngineAgreement,
  getEngineFeedback,
  getModelInsights,
  getSummary,
  getTimeseries,
  getTop,
  getCommunicationGraph,
} from '../api/stats.js'
import { queryKeys } from './queryKeys.js'

const STATS_STALE = 30_000

/**
 * KPI summary for a time window.
 * @param {{from?: string, to?: string}} [params]
 */
export function useSummary(params) {
  return useQuery({
    queryKey: queryKeys.statsSummary(params),
    queryFn: () => getSummary(params),
    staleTime: STATS_STALE,
  })
}

/**
 * Alert count time series.
 * @param {object} [params]
 */
export function useTimeseries(params) {
  return useQuery({
    queryKey: queryKeys.statsTimeseries(params),
    queryFn: () => getTimeseries(params),
    staleTime: STATS_STALE,
  })
}

/**
 * Top-N breakdown.
 * @param {object} [params]
 */
export function useTop(params) {
  return useQuery({
    queryKey: queryKeys.statsTop(params),
    queryFn: () => getTop(params),
    staleTime: STATS_STALE,
  })
}

/** Suricata vs MLP agreement. */
export function useEngineAgreement() {
  return useQuery({
    queryKey: queryKeys.engineAgreement(),
    queryFn: getEngineAgreement,
    staleTime: STATS_STALE,
  })
}

/** Per-engine analyst feedback. */
export function useEngineFeedback() {
  return useQuery({
    queryKey: queryKeys.engineFeedback(),
    queryFn: getEngineFeedback,
    staleTime: STATS_STALE,
  })
}

/** Model insight charts. */
export function useModelInsights() {
  return useQuery({
    queryKey: queryKeys.modelInsights(),
    queryFn: getModelInsights,
    staleTime: STATS_STALE,
  })
}

/** Communication graph between hosts. */
export function useCommunicationGraph(params) {
  return useQuery({
    queryKey: queryKeys.statsGraph(params),
    queryFn: () => getCommunicationGraph(params),
    staleTime: STATS_STALE,
  })
}
