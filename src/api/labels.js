// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/labels.dummy.js'

/**
 * Get the labeling queue (most uncertain first).
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function getLabelQueue() {
  // const { data } = await http.get('/labels/queue');
  // return data;
  return dummy.getLabelQueue()
}

/**
 * Submit a human label for an alert.
 * @param {string} alertId Alert id.
 * @param {string} label Human label.
 * @param {string} [comment] Optional comment.
 * @returns {Promise<object|null>}
 */
export async function submitLabel(alertId, label, comment) {
  // const { data } = await http.post('/labels', { alertId, label, comment });
  // return data;
  return dummy.submitLabel(alertId, label, comment)
}

/**
 * Undo the most recent label for an alert.
 * @param {string} alertId Alert id.
 * @returns {Promise<{undone: boolean, alert_id: string}>}
 */
export async function undoLabel(alertId) {
  // const { data } = await http.delete(`/labels/${alertId}`);
  // return data;
  return dummy.undoLabel(alertId)
}

/**
 * Export submitted labels as CSV text.
 * @returns {Promise<string>}
 */
export async function exportLabels() {
  // const { data } = await http.get('/labels/export', { responseType: 'text' });
  // return data;
  return dummy.exportLabels()
}
