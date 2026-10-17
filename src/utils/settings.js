/**
 * Read/write helpers for user preferences persisted in localStorage:
 * detection thresholds, notification channels and the display timezone.
 *
 * These utilities are intentionally framework-free so the dummy data layer and
 * the evidence helpers can consult them without importing React.
 * @module utils/settings
 */

import {
  DETECTION_DEFAULTS,
  DETECTION_SETTINGS_KEY,
  NOTIFICATION_DEFAULTS,
  NOTIFICATION_PREFS_KEY,
  TIMEZONE_KEY,
} from '../constants/settings.js'
import { DEFAULT_TIMEZONE } from './format.js'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { ...fallback }
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return { ...fallback }
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Persisting failed; the in-memory value is returned regardless.
  }
  return value
}

/**
 * Read the detection display thresholds.
 * @returns {{mlpNoiseCutoff: number, signatureWeightCutoff: number}}
 */
export function readDetectionSettings() {
  return readJson(DETECTION_SETTINGS_KEY, DETECTION_DEFAULTS)
}

/**
 * Persist a partial update to the detection display thresholds.
 * @param {object} patch Fields to merge.
 * @returns {object} The merged thresholds.
 */
export function writeDetectionSettings(patch) {
  return writeJson(DETECTION_SETTINGS_KEY, { ...readDetectionSettings(), ...patch })
}

/**
 * Reset the detection thresholds to their defaults.
 * @returns {object} The default thresholds.
 */
export function resetDetectionSettings() {
  return writeJson(DETECTION_SETTINGS_KEY, DETECTION_DEFAULTS)
}

/**
 * Read the notification channel preferences.
 * @returns {object} Preferences with per-channel `enabled`/`target` and `minSeverity`.
 */
export function readNotificationPrefs() {
  const stored = readJson(NOTIFICATION_PREFS_KEY, NOTIFICATION_DEFAULTS)
  return {
    ...stored,
    email: { ...NOTIFICATION_DEFAULTS.email, ...stored.email },
    telegram: { ...NOTIFICATION_DEFAULTS.telegram, ...stored.telegram },
    slack: { ...NOTIFICATION_DEFAULTS.slack, ...stored.slack },
  }
}

/**
 * Persist a partial update to the notification preferences.
 * @param {object} patch Fields to merge (channel objects are merged shallowly).
 * @returns {object} The merged preferences.
 */
export function writeNotificationPrefs(patch) {
  const merged = { ...readNotificationPrefs(), ...patch }
  for (const channel of ['email', 'telegram', 'slack']) {
    if (patch[channel]) merged[channel] = { ...readNotificationPrefs()[channel], ...patch[channel] }
  }
  return writeJson(NOTIFICATION_PREFS_KEY, merged)
}

/**
 * Read the preferred display timezone.
 * @returns {string} IANA timezone, falling back to the console default.
 */
export function readTimezone() {
  try {
    return localStorage.getItem(TIMEZONE_KEY) || DEFAULT_TIMEZONE
  } catch {
    return DEFAULT_TIMEZONE
  }
}

/**
 * Persist the preferred display timezone.
 * @param {string} timezone IANA timezone.
 * @returns {string} The stored timezone.
 */
export function writeTimezone(timezone) {
  try {
    localStorage.setItem(TIMEZONE_KEY, timezone)
  } catch {
    // Persisting failed; the value is returned regardless.
  }
  return timezone
}
