import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Moon, Search, Sun, User } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth.js'
import { useSensors } from '../../hooks/useSensors.js'
import { useTheme } from '../../hooks/useTheme.js'

function SensorHealth() {
  const { data, isLoading } = useSensors()
  const sensor = data?.data?.[0]

  if (isLoading || !sensor) {
    return <span className="hidden h-6 w-28 animate-pulse rounded-full bg-surface-2 sm:block" />
  }
  const online = sensor.status === 'online'
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted sm:inline-flex"
      title={`Kafka lag ${sensor.kafka_lag} · ${sensor.events_per_min} events/min`}
    >
      <span
        className={`h-2 w-2 rounded-full ${online ? 'bg-sev-low' : 'bg-sev-critical'}`}
        aria-hidden="true"
      />
      {sensor.name}
      <span className="tabular-nums">· lag {sensor.kafka_lag}</span>
    </span>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-text hover:bg-surface-2"
      >
        <User className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{user?.email ?? 'Account'}</span>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-48 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          <div className="px-2 py-1.5 text-xs text-muted">
            <p className="truncate text-text">{user?.name ?? 'User'}</p>
            <p className="capitalize">{user?.role ?? 'viewer'}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-text hover:bg-surface-2"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Top bar: global search, sensor health, theme toggle and user menu.
 */
function Topbar() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/alerts?q=${encodeURIComponent(trimmed)}` : '/alerts')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <form onSubmit={onSubmit} role="search" className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search alerts, IPs, signatures…"
          aria-label="Global search"
          className="w-full max-w-md rounded-md border border-border bg-bg py-1.5 pl-8 pr-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </form>

      <SensorHealth />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        className="rounded-md border border-border p-1.5 text-muted hover:bg-surface-2 hover:text-text"
      >
        {isDark ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      <UserMenu />
    </header>
  )
}

export default Topbar
