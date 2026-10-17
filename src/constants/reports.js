/**
 * Daily report constants: CSV export columns and severity filter.
 * @module constants/reports
 */

import { SEVERITY } from './severity.js'

/** Number of top attackers listed in the daily report. */
export const REPORT_TOP_LIMIT = 10

/** Severity tiers that count toward the "top attackers" list. */
export const REPORT_ATTACK_SEVERITIES = Object.freeze([SEVERITY.HIGH, SEVERITY.CRITICAL])

/** CSV columns for the report summary. */
export const REPORT_SUMMARY_COLUMNS = Object.freeze([
  { key: 'alerts', label: 'Alerts' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'malicious', label: 'Malicious' },
  { key: 'benign', label: 'Benign' },
  { key: 'noise_ratio', label: 'Noise Ratio' },
])

/** CSV columns for the top attackers table. */
export const REPORT_ATTACKER_COLUMNS = Object.freeze([
  { key: 'ip', label: 'Source IP' },
  { key: 'count', label: 'Alerts' },
  { key: 'severity_tier', label: 'Worst Severity' },
])

/** Keys that map a severity count object to CSV rows. */
export const REPORT_SEVERITY_COLUMNS = Object.freeze([
  { key: 'tier', label: 'Severity' },
  { key: 'count', label: 'Alerts' },
])

/** Filename template for downloaded reports. */
export function reportFilename(date) {
  return `nids-daily-report-${date}.csv`
}
