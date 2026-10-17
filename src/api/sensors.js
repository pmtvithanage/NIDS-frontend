// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/sensors.dummy.js'

/**
 * List sensors with health metrics.
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function getSensors() {
  // const { data } = await http.get('/sensors');
  // return data;
  return dummy.listSensors()
}

/**
 * Get a single sensor.
 * @param {string} id Sensor id.
 * @returns {Promise<object|null>}
 */
export async function getSensor(id) {
  // const { data } = await http.get(`/sensors/${id}`);
  // return data;
  return dummy.getSensor(id)
}
