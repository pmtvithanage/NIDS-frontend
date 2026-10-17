// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/hosts.dummy.js'

/**
 * Get a host-centric view for an IP.
 * @param {string} ip IPv4 address.
 * @returns {Promise<object|null>}
 */
export async function getHost(ip) {
  // const { data } = await http.get(`/hosts/${ip}`);
  // return data;
  return dummy.getHost(ip)
}
