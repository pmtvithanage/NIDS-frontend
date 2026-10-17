// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/alerts.dummy.js'
import * as dummyDetail from '../dummy/alertDetail.dummy.js'

/**
 * List alerts (filtering, sorting, cursor pagination).
 * @param {object} [params] Query params.
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function getAlerts(params) {
  // const { data } = await http.get('/alerts', { params });
  // return data;
  return dummy.listAlerts(params)
}

/**
 * Get a single alert.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getAlert(id) {
  // const { data } = await http.get(`/alerts/${id}`);
  // return data;
  return dummy.getAlert(id)
}

/**
 * Update a single alert (status, assignee, notes).
 * @param {string} id Alert id.
 * @param {object} patch Fields to merge.
 * @returns {Promise<object|null>}
 */
export async function updateAlert(id, patch) {
  // const { data } = await http.patch(`/alerts/${id}`, patch);
  // return data;
  return dummy.updateAlert(id, patch)
}

/**
 * Apply the same patch to many alerts.
 * @param {string[]} ids Alert ids.
 * @param {object} patch Fields to merge.
 * @returns {Promise<{updated: number, ids: string[]}>}
 */
export async function bulkUpdateAlerts(ids, patch) {
  // const { data } = await http.post('/alerts/bulk-update', { ids, patch });
  // return data;
  return dummy.bulkUpdate(ids, patch)
}

/**
 * Export the filtered alert view as CSV text.
 * @param {object} [params] Filter/sort params (same as {@link getAlerts}).
 * @returns {Promise<string>} CSV content.
 */
export async function exportAlerts(params) {
  // const { data } = await http.get('/export/alerts.csv', { params, responseType: 'text' });
  // return data;
  return dummy.exportCsv(params)
}

/**
 * Get the full detail object for an alert.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getAlertDetail(id) {
  // const { data } = await http.get(`/alerts/${id}/detail`);
  // return data;
  return dummyDetail.getAlertDetail(id)
}

/**
 * Get the explainability block for an alert.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getAlertExplain(id) {
  // const { data } = await http.get(`/alerts/${id}/explain`);
  // return data;
  return dummyDetail.getExplain(id)
}

/**
 * Get a capture window + BPF filter hint for an alert.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>}
 */
export async function getAlertPcapHint(id) {
  // const { data } = await http.get(`/alerts/${id}/pcap-hint`);
  // return data;
  return dummyDetail.getPcapHint(id)
}
