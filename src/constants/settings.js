/**
 * Settings and detection-threshold constants.
 *
 * Detection thresholds are stored in localStorage and read back by the
 * evidence helpers so the "likely noise" rule follows the operator's choice.
 * @module constants/settings
 */

/** localStorage key holding detection display thresholds. */
export const DETECTION_SETTINGS_KEY = 'nids_detection_settings'

/** localStorage key holding notification channel preferences. */
export const NOTIFICATION_PREFS_KEY = 'nids_notification_prefs'

/** localStorage key holding the display timezone. */
export const TIMEZONE_KEY = 'nids_timezone'

/** Default MLP-confidence cutoff below which a detection is "uncertain". */
export const DEFAULT_MLP_NOISE_CUTOFF = 0.7

/** Default Suricata signature-weight cutoff below which a signature is "weak". */
export const DEFAULT_SIGNATURE_WEIGHT_CUTOFF = 0.3

/** Default detection display thresholds. */
export const DETECTION_DEFAULTS = Object.freeze({
  mlpNoiseCutoff: DEFAULT_MLP_NOISE_CUTOFF,
  signatureWeightCutoff: DEFAULT_SIGNATURE_WEIGHT_CUTOFF,
})

/** Slider bounds for the 0-1 detection thresholds. */
export const THRESHOLD_RANGE = Object.freeze({ min: 0.05, max: 0.95, step: 0.01 })

/** Default notification preferences. */
export const NOTIFICATION_DEFAULTS = Object.freeze({
  email: Object.freeze({ enabled: true, target: 'soc@nids.local' }),
  telegram: Object.freeze({ enabled: false, target: '' }),
  slack: Object.freeze({ enabled: false, target: '' }),
  minSeverity: 'HIGH',
})

/** Notification channel metadata, in display order. */
export const NOTIFICATION_CHANNELS = Object.freeze([
  { key: 'email', label: 'Email', placeholder: 'soc@nids.local' },
  { key: 'telegram', label: 'Telegram', placeholder: '@soc_channel or chat id' },
  { key: 'slack', label: 'Slack', placeholder: 'https://hooks.slack.com/…' },
])

/** Selectable display timezones. */
export const TIMEZONE_OPTIONS = Object.freeze([
  { value: 'Asia/Colombo', label: 'Asia/Colombo (UTC+05:30)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
])

/** Settings tab ids in display order. */
export const SETTINGS_TABS = Object.freeze([
  { id: 'profile', label: 'Profile' },
  { id: 'users', label: 'Users and roles', adminOnly: true },
  { id: 'notifications', label: 'Notifications' },
  { id: 'detection', label: 'Detection thresholds' },
  { id: 'preferences', label: 'Timezone and theme' },
])

/** Default settings tab. */
export const SETTINGS_DEFAULT_TAB = 'profile'

/** Human-readable role names. */
export const ROLE_LABELS = Object.freeze({
  admin: 'Administrator',
  analyst: 'Analyst',
  viewer: 'Viewer',
})

/** Minimum-alert-severity options for notifications. */
export const NOTIFICATION_SEVERITIES = Object.freeze(['MEDIUM', 'HIGH', 'CRITICAL'])

/** Feedback timeout (ms) for the "saved" confirmation. */
export const SETTINGS_SAVED_TIMEOUT = 2000
