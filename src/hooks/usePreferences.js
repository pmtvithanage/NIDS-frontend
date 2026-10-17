import { useCallback, useState } from 'react'

import {
  readDetectionSettings,
  readNotificationPrefs,
  readTimezone,
  resetDetectionSettings,
  writeDetectionSettings,
  writeNotificationPrefs,
  writeTimezone,
} from '../utils/settings.js'

/**
 * Detection display thresholds backed by localStorage.
 * @returns {{settings: object, update: (patch: object) => void, reset: () => void}}
 */
export function useDetectionSettings() {
  const [settings, setSettings] = useState(readDetectionSettings)

  const update = useCallback((patch) => {
    setSettings(writeDetectionSettings(patch))
  }, [])

  const reset = useCallback(() => {
    setSettings(resetDetectionSettings())
  }, [])

  return { settings, update, reset }
}

/**
 * Notification channel preferences backed by localStorage.
 * @returns {{prefs: object, update: (patch: object) => void}}
 */
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState(readNotificationPrefs)

  const update = useCallback((patch) => {
    setPrefs(writeNotificationPrefs(patch))
  }, [])

  return { prefs, update }
}

/**
 * Preferred display timezone backed by localStorage.
 * @returns {{timezone: string, setTimezone: (tz: string) => void}}
 */
export function useTimezone() {
  const [timezone, setTimezoneState] = useState(readTimezone)

  const setTimezone = useCallback((tz) => {
    setTimezoneState(writeTimezone(tz))
  }, [])

  return { timezone, setTimezone }
}
