// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/suppressions.dummy.js'

/**
 * List suppression rules.
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function getSuppressions() {
  // const { data } = await http.get('/suppressions');
  // return data;
  return dummy.listSuppressions()
}

/**
 * Create a suppression rule.
 * @param {object} rule Rule definition.
 * @returns {Promise<object>}
 */
export async function createSuppression(rule) {
  // const { data } = await http.post('/suppressions', rule);
  // return data;
  return dummy.createSuppression(rule)
}

/**
 * Update a suppression rule.
 * @param {string} id Rule id.
 * @param {object} patch Rule fields to update.
 * @returns {Promise<object|null>}
 */
export async function updateSuppression(id, patch) {
  // const { data } = await http.patch(`/suppressions/${id}`, patch);
  // return data;
  return dummy.editSuppression(id, patch)
}

/**
 * Delete a suppression rule.
 * @param {string} id Rule id.
 * @returns {Promise<{deleted: boolean, id: string}>}
 */
export async function deleteSuppression(id) {
  // const { data } = await http.delete(`/suppressions/${id}`);
  // return data;
  return dummy.deleteSuppression(id)
}

/**
 * Dry-run a rule and count matching alerts.
 * @param {object} rule Rule definition.
 * @returns {Promise<{would_hide: number, samples: string[]}>}
 */
export async function dryRunSuppression(rule) {
  // const { data } = await http.post('/suppressions/dry-run', rule);
  // return data;
  return dummy.dryRun(rule)
}
