import { useQuery } from '@tanstack/react-query'

import { getAnalyticsOverview, getFeatureCatalog, getFeatureScatter } from '../api/analytics.js'
import { queryKeys } from './queryKeys.js'

const ANALYTICS_STALE = 60_000

/**
 * Aggregated analytics overview.
 * @param {{timezone?: string}} [params]
 */
export function useAnalyticsOverview(params) {
  return useQuery({
    queryKey: queryKeys.analyticsOverview(params),
    queryFn: () => getAnalyticsOverview(params),
    staleTime: ANALYTICS_STALE,
  })
}

/** Numeric feature catalog for the explorer. */
export function useFeatureCatalog() {
  return useQuery({
    queryKey: ['analytics', 'features'],
    queryFn: getFeatureCatalog,
    staleTime: Infinity,
  })
}

/**
 * Scatter points for two features.
 * @param {{x?: string, y?: string}} [params]
 */
export function useFeatureScatter(params) {
  return useQuery({
    queryKey: queryKeys.featureScatter(params),
    queryFn: () => getFeatureScatter(params),
    staleTime: ANALYTICS_STALE,
    enabled: Boolean(params?.x && params?.y),
  })
}
