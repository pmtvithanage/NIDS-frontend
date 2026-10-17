/**
 * Dummy labeling resource: an uncertainty-sorted queue plus CSV export.
 * @module dummy/labels.dummy
 */

import { addLabel, getAlerts, getState, patchAlert, removeLabel } from './store.js'
import { delay } from './helpers.js'

const CSV_HEADER = 'alert_id,flow_key,mlp_label,mlp_confidence,human_label,labeled_by,labeled_at'

/**
 * Queue of alerts to label, most uncertain first (confidence closest to 0.5).
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 */
export async function getLabelQueue() {
  await delay()
  const data = getAlerts()
    .filter((a) => !a.human_label)
    .slice()
    .sort((a, b) => Math.abs(a.mlp_confidence - 0.5) - Math.abs(b.mlp_confidence - 0.5))
    .map((a) => ({
      id: a.id,
      flow_key: a.flow_key,
      ts: a.ts,
      severity_tier: a.severity_tier,
      mlp_label: a.mlp_label,
      mlp_confidence: a.mlp_confidence,
      ae_ratio: a.ae_ratio,
      signature: a.suricata.signature,
      suggested: a.likely_benign ? 'BENIGN' : a.mlp_label,
    }))
  return { data, meta: { total: data.length } }
}

/**
 * Submit a human label for an alert.
 * @param {string} alertId Alert id.
 * @param {string} label Human label.
 * @param {string} [comment=''] Optional comment.
 * @returns {Promise<object|null>} Stored label entry.
 */
export async function submitLabel(alertId, label, comment = '') {
  await delay()
  const alert = patchAlert(alertId, { human_label: label })
  if (!alert) return null
  return addLabel({
    id: `${alertId}:${Date.now()}`,
    alert_id: alertId,
    label,
    comment,
    labeled_by: 'analyst@nids.local',
    labeled_at: new Date().toISOString(),
  })
}

/**
 * Undo the most recent label for an alert.
 * @param {string} alertId Alert id.
 * @returns {Promise<{undone: boolean, alert_id: string}>}
 */
export async function undoLabel(alertId) {
  await delay()
  const removed = removeLabel(alertId)
  if (removed) patchAlert(alertId, { human_label: null })
  return { undone: Boolean(removed), alert_id: alertId }
}

/**
 * Export all submitted labels as CSV text.
 * @returns {Promise<string>} CSV content.
 */
export async function exportLabels() {
  await delay()
  const rows = getState().labels.map((entry) => {
    const alert = getAlerts().find((a) => a.id === entry.alert_id)
    return [
      entry.alert_id,
      alert?.flow_key ?? '',
      alert?.mlp_label ?? '',
      alert?.mlp_confidence ?? '',
      entry.label,
      entry.labeled_by,
      entry.labeled_at,
    ].join(',')
  })
  return [CSV_HEADER, ...rows].join('\n')
}
