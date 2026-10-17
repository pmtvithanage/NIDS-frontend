import { useQuery } from '@tanstack/react-query'

import { getUsers } from '../api/users.js'
import { queryKeys } from './queryKeys.js'

/**
 * List console users (admin only).
 * @param {{enabled?: boolean}} [options]
 */
export function useUsers({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: getUsers,
    enabled,
    staleTime: 60_000,
  })
}
