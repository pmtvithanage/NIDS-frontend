/**
 * IPv4 matching helpers for the IP/CIDR alert filter.
 * @module utils/ip
 */

const IPV4_PART_COUNT = 4
const BIT_COUNT = 32

/**
 * Parse a dotted-quad IPv4 address into a 32-bit unsigned integer.
 * @param {string} ip IPv4 address.
 * @returns {number|null} Integer value, or null when invalid.
 */
export function ipv4ToInt(ip) {
  const parts = String(ip).trim().split('.')
  if (parts.length !== IPV4_PART_COUNT) return null
  let value = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    value = value * 256 + octet
  }
  return value >>> 0
}

/**
 * Test whether an IPv4 address falls inside a CIDR block.
 * @param {string} ip IPv4 address.
 * @param {string} cidr CIDR block such as `192.168.8.0/24`.
 * @returns {boolean}
 */
export function ipv4InCidr(ip, cidr) {
  const [base, bitsRaw] = String(cidr).split('/')
  const bits = Number(bitsRaw)
  if (!Number.isInteger(bits) || bits < 0 || bits > BIT_COUNT) return false
  const ipInt = ipv4ToInt(ip)
  const baseInt = ipv4ToInt(base)
  if (ipInt == null || baseInt == null) return false
  if (bits === 0) return true
  const mask = (0xffffffff << (BIT_COUNT - bits)) >>> 0
  return (ipInt & mask) === (baseInt & mask)
}

/**
 * Validate an IPv4 CIDR block such as `192.168.8.0/24` or `10.0.0.1/32`.
 * Accepts a bare IPv4 address too (implicitly `/32`).
 * @param {string} cidr Candidate CIDR or address.
 * @returns {boolean} True when the value is a well-formed IPv4 block.
 */
export function isValidCidr(cidr) {
  if (typeof cidr !== 'string' || !cidr.trim()) return false
  const [base, bitsRaw, ...rest] = cidr.trim().split('/')
  if (rest.length) return false
  if (ipv4ToInt(base) == null) return false
  if (bitsRaw == null) return true
  const bits = Number(bitsRaw)
  return Number.isInteger(bits) && bits >= 0 && bits <= BIT_COUNT
}

/**
 * Match an IP value against a user query (exact/partial or CIDR).
 * @param {string|null|undefined} ipValue Candidate IP.
 * @param {string} query User query.
 * @returns {boolean}
 */
export function matchesIpQuery(ipValue, query) {
  if (!ipValue) return false
  const q = String(query).trim()
  if (!q) return false
  if (q.includes('/')) return ipv4InCidr(ipValue, q)
  return ipValue.includes(q)
}
