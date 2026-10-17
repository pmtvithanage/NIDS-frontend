/**
 * Dummy users resource: the console's operator roster (admin-only view).
 * @module dummy/users.dummy
 */

import { getState } from './store.js'
import { delay } from './helpers.js'

/**
 * List console users without their credentials.
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 */
export async function listUsers() {
  await delay()
  const data = getState().users.map(({ password: _password, ...user }) => user)
  return { data, meta: { total: data.length } }
}
