import Toggle from '../common/Toggle.jsx'
import { NOTIFICATION_CHANNELS, NOTIFICATION_SEVERITIES } from '../../constants/settings.js'
import { useNotificationPrefs } from '../../hooks/usePreferences.js'
import { useToast } from '../../hooks/useToast.js'

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50'

/** Notification channels and their alert routing preferences. */
function NotificationsTab() {
  const { prefs, update } = useNotificationPrefs()
  const { toast } = useToast()

  const testChannel = (channel, label) => {
    if (!prefs[channel].target) {
      toast(`Set a destination for ${label} first.`, { variant: 'warning' })
      return
    }
    toast(`Test ${label} notification queued.`, { title: 'Notifications', variant: 'success' })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text">Alert routing</p>
        <label className="text-xs text-muted">
          Minimum severity
          <select
            value={prefs.minSeverity}
            onChange={(event) => update({ minSeverity: event.target.value })}
            className="ml-2 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {NOTIFICATION_SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {NOTIFICATION_CHANNELS.map((channel) => {
          const value = prefs[channel.key]
          return (
            <div key={channel.key} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <Toggle
                  label={channel.label}
                  checked={value.enabled}
                  onChange={(enabled) => update({ [channel.key]: { enabled } })}
                />
                <button
                  type="button"
                  onClick={() => testChannel(channel.key, channel.label)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-text focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  Send test
                </button>
              </div>
              <input
                type="text"
                value={value.target}
                disabled={!value.enabled}
                placeholder={channel.placeholder}
                onChange={(event) => update({ [channel.key]: { target: event.target.value } })}
                aria-label={`${channel.label} destination`}
                className={INPUT_CLASS}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NotificationsTab
