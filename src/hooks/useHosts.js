import { useQuery } from '@tanstack/react-query'

import { getHost } from '../api/hosts.js'
import { queryKeys } from './queryKeys.js'

/**
 * Query a host-centric view for an IP.
 * @param {string} ip IPv4 address.
 */
export function useHost(ip) {
  return useQuery({
    queryKey: queryKeys.host(ip),
    queryFn: () => getHost(ip),
    enabled: Boolean(ip),
    staleTime: 30_000,
  })
}
