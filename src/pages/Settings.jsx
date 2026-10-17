import ChartCard from '../components/common/ChartCard.jsx'
import SettingsTabs from '../components/settings/SettingsTabs.jsx'
import ProfileTab from '../components/settings/ProfileTab.jsx'
import UsersTab from '../components/settings/UsersTab.jsx'
import NotificationsTab from '../components/settings/NotificationsTab.jsx'
import DetectionTab from '../components/settings/DetectionTab.jsx'
import PreferencesTab from '../components/settings/PreferencesTab.jsx'
import { SETTINGS_DEFAULT_TAB, SETTINGS_TABS } from '../constants/settings.js'
import { useIsAdmin } from '../hooks/useRole.js'
import { useUrlState } from '../hooks/useUrlState.js'

const SETTINGS_FILTER_DEFAULTS = { tab: SETTINGS_DEFAULT_TAB }

const TAB_CONTENT = {
  profile: ProfileTab,
  users: UsersTab,
  notifications: NotificationsTab,
  detection: DetectionTab,
  preferences: PreferencesTab,
}

function resolveTab(requested, isAdmin) {
  const match = SETTINGS_TABS.find((tab) => tab.id === requested)
  if (!match) return SETTINGS_DEFAULT_TAB
  if (match.adminOnly && !isAdmin) return SETTINGS_DEFAULT_TAB
  return match.id
}

/** Operator settings: profile, users, notifications, thresholds and preferences. */
function Settings() {
  const isAdmin = useIsAdmin()
  const [filters, setFilters] = useUrlState(SETTINGS_FILTER_DEFAULTS)
  const active = resolveTab(filters.tab, isAdmin)
  const Tab = TAB_CONTENT[active]

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-text">Settings</h1>
        <p className="text-xs text-muted">Manage your profile, alert routing and detection preferences.</p>
      </header>

      <SettingsTabs active={active} onChange={(tab) => setFilters({ tab })} />

      <ChartCard title={SETTINGS_TABS.find((tab) => tab.id === active)?.label ?? 'Settings'}>
        <Tab />
      </ChartCard>
    </div>
  )
}

export default Settings
