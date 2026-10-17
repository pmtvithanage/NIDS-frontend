/**
 * Flow helpers for the alert detail view: flow-key parsing, the CICFlowMeter
 * null sentinel, and the data-integrity cross-check.
 * @module utils/flow
 */

import { FLOW_NULL_SENTINEL } from '../constants/alerts.js'

/**
 * Extract the destination port encoded in a flow key (`src-dst-port`).
 * @param {string} [flowKey] Flow key from the feature pipeline.
 * @returns {number|null} Port, or null when the key has no IP tuple.
 */
export function parseFlowKeyPort(flowKey) {
  if (typeof flowKey !== 'string') return null
  const parts = flowKey.split('-')
  if (parts.length < 3) return null
  const port = Number(parts[parts.length - 1])
  return Number.isInteger(port) ? port : null
}

/**
 * Render a feature value, mapping the CICFlowMeter null sentinel to "n/a".
 * @param {number|null|undefined} value Feature value.
 * @returns {string} Display value.
 */
export function formatFeatureValue(value) {
  if (value == null || value === FLOW_NULL_SENTINEL) return 'n/a'
  return String(value)
}

/**
 * Whether the flow key port disagrees with the feature vector destination port.
 * @param {string} [flowKey] Flow key.
 * @param {number} [featureDstPort] `Destination Port` feature value.
 * @returns {boolean}
 */
export function hasPortMismatch(flowKey, featureDstPort) {
  const port = parseFlowKeyPort(flowKey)
  if (port == null || featureDstPort == null) return false
  return port !== featureDstPort
}
