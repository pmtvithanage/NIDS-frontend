/**
 * Demo credentials seeded by the dummy auth layer.
 * @module constants/devAccounts
 */

/** @type {ReadonlyArray<{email:string, password:string, role:string}>} */
export const DEV_ACCOUNTS = Object.freeze([
  { email: 'admin@nids.local', password: 'admin', role: 'admin' },
  { email: 'analyst@nids.local', password: 'analyst', role: 'analyst' },
  { email: 'viewer@nids.local', password: 'viewer', role: 'viewer' },
])
