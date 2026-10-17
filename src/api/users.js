// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/users.dummy.js'

/**
 * List console users (admin only).
 * @returns {Promise<{data: object[], meta: object}>}
 */
export async function getUsers() {
  // const { data } = await http.get('/users');
  // return data;
  return dummy.listUsers()
}
