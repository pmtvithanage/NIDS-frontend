// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/auth.dummy.js'

/**
 * Authenticate and obtain a JWT.
 * @param {string} email User email.
 * @param {string} password Plain password.
 * @returns {Promise<{token: string, user: object, expires_in: number}>}
 */
export async function login(email, password) {
  // const { data } = await http.post('/auth/login', { email, password });
  // return data;
  return dummy.login(email, password)
}

/**
 * Return the current session derived from the stored token.
 * @returns {Promise<{user: object}|null>}
 */
export async function me() {
  // const { data } = await http.get('/auth/me');
  // return data;
  return dummy.me()
}
