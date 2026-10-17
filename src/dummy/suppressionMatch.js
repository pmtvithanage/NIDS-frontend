/**
 * Shared suppression match predicate used by the suppressions resource and the
 * alerts list ("hide suppressed" filter).
 *
 * A "rule" is `{ match, max_severity?, expires_at? }`; a bare match object is
 * also accepted for backwards compatibility. An expired rule never matches, and
 * `max_severity` caps the highest tier a rule is allowed to hide.
 * @module dummy/suppressionMatch
 */

import { SEVERITY_RANK } from '../constants/severity.js'
import { ipv4InCidr } from '../utils/ip.js'

function matchField(alert, key, value) {
  if (value == null || value === '') return true
  if (key === 'q') {
    const q = String(value).toLowerCase()
    return [alert.id, alert.src_ip, alert.dst_ip, alert.suricata?.signature]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  }
  if (key === 'signature_id') return alert.suricata?.signature_id === Number(value)
  if (key === 'dst_port') return alert.dst_port === Number(value)
  if (key === 'src_cidr') return Boolean(alert.src_ip) && ipv4InCidr(alert.src_ip, value)
  if (key === 'dst_cidr') return Boolean(alert.dst_ip) && ipv4InCidr(alert.dst_ip, value)
  if (key === 'severity') return alert.severity_tier === value
  return alert[key] === value
}

/**
 * Test whether an alert satisfies a suppression rule (or a bare match map).
 * @param {object} alert Alert object.
 * @param {object} [ruleOrMatch] Rule (`{match, max_severity, expires_at}`) or match map.
 * @param {number} [now=Date.now()] Reference time for expiry checks (ms).
 * @returns {boolean}
 */
export function matchesAlert(alert, ruleOrMatch = {}, now = Date.now()) {
  const rule = ruleOrMatch.match ? ruleOrMatch : { match: ruleOrMatch }

  if (rule.expires_at && new Date(rule.expires_at).getTime() < now) return false

  if (rule.max_severity) {
    const cap = SEVERITY_RANK[rule.max_severity]
    const tier = SEVERITY_RANK[alert.severity_tier]
    if (cap == null || tier == null || tier > cap) return false
  }

  return Object.entries(rule.match).every(([key, value]) => matchField(alert, key, value))
}
