/**
 * Dummy hosts resource: per-IP views derived from the alert set.
 * @module dummy/hosts.dummy
 */

import { getAlerts } from './store.js'
import { delay, hashString } from './helpers.js'
import { SEVERITY_ORDER } from '../constants/severity.js'

const ASN_POOL = [
  { asn: 'AS8075', org: 'Microsoft Corporation', country: 'US' },
  { asn: 'AS16509', org: 'Amazon.com, Inc.', country: 'US' },
  { asn: 'AS13335', org: 'Cloudflare, Inc.', country: 'US' },
  { asn: 'AS4134', org: 'Chinanet', country: 'CN' },
  { asn: 'AS24940', org: 'Hetzner Online GmbH', country: 'DE' },
  { asn: 'AS0', org: 'Private Network', country: 'LK' },
]

/**
 * Whether an IP belongs to a private/link-local range.
 * @param {string} ip IPv4 address.
 * @returns {boolean}
 */
export function isInternalIp(ip) {
  if (!ip) return false
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('192.168.')) return true
  if (ip.startsWith('127.')) return true
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) return true
  return false
}

/**
 * Resolve the (dummy) geo/ASN record for an IP.
 * @param {string} ip IPv4 address.
 * @returns {{asn: string, org: string, country: string}}
 */
export function hostGeo(ip) {
  return isInternalIp(ip)
    ? ASN_POOL[ASN_POOL.length - 1]
    : ASN_POOL[hashString(ip) % (ASN_POOL.length - 1)]
}

function countBy(list) {
  const map = new Map()
  for (const value of list) map.set(value, (map.get(value) ?? 0) + 1)
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get a host-centric view for an IP.
 * @param {string} ip IPv4 address.
 * @returns {Promise<object|null>}
 */
export async function getHost(ip) {
  await delay()
  const alerts = getAlerts().filter((a) => a.src_ip === ip || a.dst_ip === ip)
  if (alerts.length === 0) return null

  const sorted = alerts.slice().sort((a, b) => new Date(a.ts) - new Date(b.ts))
  const asSource = sorted.filter((a) => a.src_ip === ip)
  const asTarget = sorted.filter((a) => a.dst_ip === ip)
  const peers = countBy(
    sorted.map((a) => (a.src_ip === ip ? a.dst_ip : a.src_ip)).filter(Boolean),
  ).slice(0, 10)
  const ports = countBy(asSource.map((a) => a.dst_port).filter(Boolean))
  const severity_breakdown = Object.fromEntries(SEVERITY_ORDER.map((t) => [t, 0]))
  for (const a of sorted) severity_breakdown[a.severity_tier] += 1

  const entry = hostGeo(ip)

  return {
    ip,
    is_internal: isInternalIp(ip),
    asn: entry.asn,
    org: entry.org,
    country: entry.country,
    rdns: isInternalIp(ip) ? null : `ptr.${entry.asn.toLowerCase()}.example.net`,
    role: asSource.length >= asTarget.length ? 'source' : 'target',
    first_seen: sorted[0].ts,
    last_seen: sorted[sorted.length - 1].ts,
    alert_count: sorted.length,
    as_source: asSource.length,
    as_target: asTarget.length,
    severity_breakdown,
    ports_contacted: ports,
    peers,
    alert_history: sorted
      .slice()
      .reverse()
      .map((a) => ({
        id: a.id,
        ts: a.ts,
        severity_tier: a.severity_tier,
        mlp_label: a.mlp_label,
        signature: a.suricata.signature,
        direction: a.direction,
      })),
    generated_at: new Date().toISOString(),
  }
}
