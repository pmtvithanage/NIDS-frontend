/**
 * Dummy suppressions resource: CRUD plus a dry-run that reports how many
 * existing alerts a rule would hide.
 * @module dummy/suppressions.dummy
 */

import { addSuppression, getAlerts, getState, removeSuppression, updateSuppression } from './store.js'
import { matchesAlert as matches } from './suppressionMatch.js'
import { delay, makeId } from './helpers.js'

function countHits(rule) {
  return getAlerts().filter((alert) => matches(alert, rule)).length
}

function normalize(rule) {
  return {
    reason: rule.reason ?? '',
    enabled: rule.enabled ?? true,
    match: rule.match ?? {},
    max_severity: rule.max_severity ?? null,
    expires_at: rule.expires_at ?? null,
  }
}

/**
 * List suppression rules with live hit counts.
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 */
export async function listSuppressions() {
  await delay()
  const data = getState().suppressions.map((rule) => ({ ...rule, hit_count: countHits(rule) }))
  return { data, meta: { total: data.length } }
}

/**
 * Create a suppression rule.
 * @param {object} rule Rule ({name, reason?, enabled?, match, max_severity?, expires_at?}).
 * @returns {Promise<object>} Created rule.
 */
export async function createSuppression(rule) {
  await delay()
  const created = {
    id: makeId('sup'),
    name: rule.name,
    ...normalize(rule),
    created_by: rule.created_by ?? 'analyst@nids.local',
    created_at: new Date().toISOString(),
    hit_count: 0,
  }
  addSuppression(created)
  return { ...created, hit_count: countHits(created) }
}

/**
 * Update an existing suppression rule.
 * @param {string} id Rule id.
 * @param {object} patch Fields to update.
 * @returns {Promise<object|null>} Updated rule with a live hit count.
 */
export async function editSuppression(id, patch) {
  await delay()
  const fields = {}
  for (const key of ['name', 'reason', 'enabled', 'match', 'max_severity', 'expires_at']) {
    if (key in patch) fields[key] = patch[key]
  }
  const updated = updateSuppression(id, fields)
  if (!updated) return null
  return { ...updated, hit_count: countHits(updated) }
}

/**
 * Delete a suppression rule.
 * @param {string} id Rule id.
 * @returns {Promise<{deleted: boolean, id: string}>}
 */
export async function deleteSuppression(id) {
  await delay()
  return { deleted: removeSuppression(id), id }
}

/**
 * Dry-run a rule against existing alerts.
 * @param {object} rule Rule to evaluate ({match, max_severity?, expires_at?}).
 * @returns {Promise<{would_hide: number, samples: string[]}>}
 */
export async function dryRun(rule) {
  await delay()
  const hits = getAlerts().filter((alert) => matches(alert, rule))
  return { would_hide: hits.length, samples: hits.slice(0, 10).map((alert) => alert.id) }
}
