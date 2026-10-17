import { createContext, useContext } from 'react'

/** React context carrying the auth session. */
export const AuthContext = createContext(null)

/**
 * Access the current auth session and controls.
 * @returns {{user: object|null, token: string|null, isAuthenticated: boolean,
 *   login: (email: string, password: string) => Promise<object>,
 *   logout: () => void}}
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
