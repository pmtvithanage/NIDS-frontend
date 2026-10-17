import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, Shield } from 'lucide-react'

import { NAV_ITEMS } from '../../constants/nav.js'

const COLLAPSE_QUERY = '(max-width: 1024px)'

/**
 * Primary navigation. Collapses to icons on narrow widths.
 */
function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.matchMedia(COLLAPSE_QUERY).matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    let query
    try {
      query = window.matchMedia(COLLAPSE_QUERY)
    } catch {
      return undefined
    }
    const handler = (event) => setCollapsed(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <Shield className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        {collapsed ? null : <span className="truncate text-sm font-semibold text-text">NIDS Console</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {collapsed ? <span className="sr-only">{label}</span> : <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex h-11 items-center gap-2 border-t border-border px-3 text-xs text-muted hover:bg-surface-2 hover:text-text"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        )}
        {collapsed ? null : <span>Collapse</span>}
      </button>
    </aside>
  )
}

export default Sidebar
