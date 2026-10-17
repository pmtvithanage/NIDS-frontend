import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'

import { DEV_ACCOUNTS } from '../constants/devAccounts.js'
import { useAuth } from '../hooks/useAuth.js'

/** Login page: any seeded demo account authenticates. */
function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const from = location.state?.from ?? '/'

  const onSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const fill = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 text-text">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-accent" aria-hidden="true" />
          <h1 className="text-lg font-semibold">NIDS Console</h1>
        </div>
        <p className="mt-1 text-sm text-muted">Sign in to access the console.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs text-sev-critical">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Sign in
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs text-muted">Demo accounts</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DEV_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fill(account)}
                className="rounded border border-border px-2 py-1 text-[11px] text-muted hover:bg-surface-2 hover:text-text"
              >
                {account.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
