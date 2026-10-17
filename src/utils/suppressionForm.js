/**
 * Pure form helpers for the suppression rule dialog (create/edit).
 * @module utils/suppressionForm
 */

import { isValidCidr } from './ip.js'

const MAX_PORT = 65_535

/**
 * Convert an ISO timestamp to a `datetime-local` input value.
 * @param {string|null|undefined} iso ISO UTC string.
 * @returns {string} Local input value, or '' when absent/invalid.
 */
export function toLocalInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

/**
 * Convert a `datetime-local` input value back to an ISO UTC string.
 * @param {string} value Local input value.
 * @returns {string|null} ISO UTC string, or null when empty/invalid.
 */
export function fromLocalInput(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * Build the API `match` object from form fields, omitting blanks.
 * @param {object} form Rule form state.
 * @returns {object} Match map.
 */
export function buildMatch(form) {
  const match = {}
  if (form.signatureId.trim()) match.signature_id = Number(form.signatureId)
  if (form.srcCidr.trim()) match.src_cidr = form.srcCidr.trim()
  if (form.dstCidr.trim()) match.dst_cidr = form.dstCidr.trim()
  if (form.dstPort.trim()) match.dst_port = Number(form.dstPort)
  return match
}

/**
 * Validate a rule form.
 * @param {object} form Rule form state.
 * @returns {string|null} Error message, or null when valid.
 */
export function validateRuleForm(form) {
  if (!form.name.trim()) return 'Name is required.'
  if (form.signatureId.trim() && !/^\d+$/.test(form.signatureId.trim())) {
    return 'Signature id must be numeric.'
  }
  if (form.srcCidr.trim() && !isValidCidr(form.srcCidr.trim())) return 'Source CIDR is invalid.'
  if (form.dstCidr.trim() && !isValidCidr(form.dstCidr.trim())) return 'Destination CIDR is invalid.'
  if (form.dstPort.trim()) {
    const port = Number(form.dstPort)
    if (!Number.isInteger(port) || port < 0 || port > MAX_PORT) return `Port must be 0-${MAX_PORT}.`
  }
  if (Object.keys(buildMatch(form)).length === 0) return 'Add at least one match condition.'
  return null
}

/**
 * Build the initial form state for create/edit.
 * @param {object|null} rule Existing rule, or null to create.
 * @returns {object} Form state.
 */
export function initialRuleForm(rule) {
  const match = rule?.match ?? {}
  return {
    name: rule?.name ?? '',
    reason: rule?.reason ?? '',
    enabled: rule?.enabled ?? true,
    signatureId: match.signature_id != null ? String(match.signature_id) : '',
    srcCidr: match.src_cidr ?? '',
    dstCidr: match.dst_cidr ?? '',
    dstPort: match.dst_port != null ? String(match.dst_port) : '',
    maxSeverity: rule?.max_severity ?? '',
    expiresAt: toLocalInput(rule?.expires_at),
  }
}
