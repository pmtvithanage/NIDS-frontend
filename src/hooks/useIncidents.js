import { useQuery } from '@tanstack/react-query'

import { getIncident, getIncidents } from '../api/incidents.js'
import { queryKeys } from './queryKeys.js'

const INCIDENTS_STALE = 30_000

/**
 * Query the incidents list.
 * @param {object} [params]
 */
export function useIncidents(params) {
  return useQuery({
    queryKey: queryKeys.incidents(params),
    queryFn: () => getIncidents(params),
    staleTime: INCIDENTS_STALE,
  })
}

/**
 * Query a single incident.
 * @param {string} id Incident id.
 */
export function useIncident(id) {
  return useQuery({
    queryKey: queryKeys.incident(id),
    queryFn: () => getIncident(id),
    enabled: Boolean(id),
    staleTime: INCIDENTS_STALE,
  })
}
