import Toggle from '../common/Toggle.jsx'
import { TIMEZONE_OPTIONS } from '../../constants/settings.js'
import { THEME } from '../../constants/theme.js'
import { useTimezone } from '../../hooks/usePreferences.js'
import { useTheme } from '../../hooks/useTheme.js'

/** Display timezone and interface theme preferences. */
function PreferencesTab() {
  const { timezone, setTimezone } = useTimezone()
  const { isDark, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <label htmlFor="settings-timezone" className="text-sm text-text">
          Display timezone
        </label>
        <p className="mt-1 text-xs text-muted">All timestamps are stored in UTC and shown in this timezone.</p>
        <select
          id="settings-timezone"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          className="mt-2 w-full max-w-sm rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {TIMEZONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <p className="text-sm text-text">Dark theme</p>
          <p className="text-xs text-muted">Dark mode is the console default.</p>
        </div>
        <Toggle
          label={isDark ? 'On' : 'Off'}
          checked={isDark}
          onChange={(checked) => setTheme(checked ? THEME.DARK : THEME.LIGHT)}
        />
      </div>
    </div>
  )
}

export default PreferencesTab
