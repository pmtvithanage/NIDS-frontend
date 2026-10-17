/**
 * Dummy auth resource. Returns a fake JWT plus the user profile.
 * @module dummy/auth.dummy
 */

import { getState } from './store.js'
import { delay } from './helpers.js'

const EXPIRES_IN_SECONDS = 3600

function base64Url(value) {
  const json = JSON.stringify(value)
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fakeJwt(payload) {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' })
  return `${header}.${base64Url(payload)}.dummy-signature`
}

/**
 * Authenticate a user.
 * @param {string} email User email.
 * @param {string} password Plain password (dummy only).
 * @returns {Promise<{token: string, user: {email: string, role: string, name: string}, expires_in: number}>}
 * @throws {Error} When credentials are invalid.
 */
export async function login(email, password) {
  await delay()
  const user = getState().users.find((u) => u.email === email)
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password')
  }
  const issuedAt = Math.floor(Date.now() / 1000)
  const token = fakeJwt({
    sub: user.email,
    role: user.role,
    iat: issuedAt,
    exp: issuedAt + EXPIRES_IN_SECONDS,
  })
  return {
    token,
    user: { email: user.email, role: user.role, name: user.name },
    expires_in: EXPIRES_IN_SECONDS,
  }
}

/**
 * Return the current session from the stored token (dummy stub).
 * @returns {Promise<{user: {email: string, role: string}}|null>}
 */
export async function me() {
  await delay()
  try {
    const token = localStorage.getItem('nids_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { user: { email: payload.sub, role: payload.role } }
  } catch {
    return null
  }
}
