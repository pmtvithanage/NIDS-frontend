// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/incidents.dummy.js'

/**
 * List incidents.
 * @param {object} [params] Query params.
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function getIncidents(params) {
  // const { data } = await http.get('/incidents', { params });
  // return data;
  return dummy.listIncidents(params)
}

/**
 * Get a single incident with timeline.
 * @param {string} id Incident id.
 * @returns {Promise<object|null>}
 */
export async function getIncident(id) {
  // const { data } = await http.get(`/incidents/${id}`);
  // return data;
  return dummy.getIncident(id)
}
