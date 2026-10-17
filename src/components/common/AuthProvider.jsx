import { useCallback, useMemo, useState } from 'react'

import { login as apiLogin } from '../../api/auth.js'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../../constants/storage.js'
import { AuthContext } from '../../hooks/useAuth.js'

function readStoredSession() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const user = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null')
    return token && user ? { token, user } : null
  } catch {
    return null
  }
}

/**
 * Provides login/logout and the persisted session.
 * @param {{children: import('react').ReactNode}} props
 */
function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password)
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user))
    } catch {
      // Persisting failed; keep the in-memory session.
    }
    setSession({ token: result.token, user: result.user })
    return result
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
