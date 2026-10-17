import { useAuth } from './useAuth.js'

/** Admin role identifier. */
export const ROLE_ADMIN = 'admin'

/**
 * Whether the current user has the admin role. Used to gate admin-only UI.
 * @returns {boolean}
 */
export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === ROLE_ADMIN
}
