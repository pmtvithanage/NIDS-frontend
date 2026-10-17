import { SETTINGS_TABS } from '../../constants/settings.js'
import { useIsAdmin } from '../../hooks/useRole.js'

/**
 * Settings section tabs. Admin-only tabs are hidden for other roles.
 * @param {{active: string, onChange: (id: string) => void}} props
 */
function SettingsTabs({ active, onChange }) {
  const isAdmin = useIsAdmin()
  const tabs = SETTINGS_TABS.filter((tab) => !tab.adminOnly || isAdmin)

  return (
    <nav aria-label="Settings sections" className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={selected ? 'page' : undefined}
            onClick={() => onChange(tab.id)}
            className={`rounded-t-md border-b-2 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent ${
              selected
                ? 'border-accent text-text'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export default SettingsTabs
