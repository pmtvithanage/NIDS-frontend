/**
 * Overview helpers: build `/alerts` deep links so dashboard widgets can open
 * the alerts list pre-filtered.
 * @module utils/overview
 */

import { SEVERITY } from '../constants/severity.js'
import { ALERT_STATUS } from '../constants/statuses.js'

/**
 * Build an `/alerts` URL with the given filters. Empty values are dropped and
 * repeated keys are joined with commas (the alerts page parses csv arrays).
 * @param {Record<string, string|number|Array<string|number>|null|undefined>} filters
 * @returns {string} Relative href.
 */
export function buildAlertsHref(filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) continue
    params.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const query = params.toString()
  return query ? `/alerts?${query}` : '/alerts'
}

/**
 * Deep link to the alerts list scoped to a time window.
 * @param {string|null} from ISO lower bound.
 * @param {string|null} to ISO upper bound.
 * @returns {string} Relative href.
 */
export function buildRangeHref(from, to) {
  if (!from || !to) return '/alerts'
  return buildAlertsHref({ range: 'custom', from, to })
}

/** Deep link to unreviewed CRITICAL alerts. */
export const CRITICAL_UNREVIEWED_HREF = buildAlertsHref({
  severity: [SEVERITY.CRITICAL],
  status: [ALERT_STATUS.NEW],
})

/** Deep link to CRITICAL alerts with low evidence quality. */
export const CRITICAL_LOW_EVIDENCE_HREF = buildAlertsHref({
  severity: [SEVERITY.CRITICAL],
  evidence_quality: 'low',
})
