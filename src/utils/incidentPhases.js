/**
 * Derive an incident's attack phases from the ordered alert timeline.
 *
 * Phases follow the canonical kill-chain order (recon → exploit → impact); the
 * summary is derived from the sequence of MLP labels and Suricata categories.
 * @module utils/incidentPhases
 */

import {
  INCIDENT_PHASE_META,
  INCIDENT_PHASE_ORDER,
  PHASE_BY_CATEGORY,
  PHASE_BY_LABEL,
} from '../constants/incidents.js'

/**
 * Classify a single timeline entry into an incident phase.
 * @param {{mlp_label?: string, category?: string}} entry Timeline entry.
 * @returns {'recon'|'exploit'|'impact'|null} Phase key, or null when unknown.
 */
export function phaseForAlert(entry) {
  return PHASE_BY_LABEL[entry?.mlp_label] ?? PHASE_BY_CATEGORY[entry?.category] ?? null
}

/**
 * Summarize the phases present across an ordered alert timeline.
 * @param {Array<{mlp_label?: string, category?: string, ts?: string}>} [timeline=[]] Entries in time order.
 * @returns {{ sequence: Array<{phase: string, count: number, first_ts: string|null,
 *   last_ts: string|null}>, label: string, summary: string, hasData: boolean }}
 */
export function deriveIncidentPhases(timeline = []) {
  const buckets = new Map()
  for (const entry of timeline) {
    const phase = phaseForAlert(entry)
    if (!phase) continue
    const bucket = buckets.get(phase) ?? { phase, count: 0, first_ts: null, last_ts: null }
    bucket.count += 1
    if (entry.ts && (!bucket.first_ts || entry.ts < bucket.first_ts)) bucket.first_ts = entry.ts
    if (entry.ts && (!bucket.last_ts || entry.ts > bucket.last_ts)) bucket.last_ts = entry.ts
    buckets.set(phase, bucket)
  }

  const sequence = INCIDENT_PHASE_ORDER.map((phase) => buckets.get(phase)).filter(Boolean)
  const label = sequence.map((item) => INCIDENT_PHASE_META[item.phase].short).join(' \u2192 ')

  let summary = 'No kill-chain phase could be derived from the contributing alerts.'
  if (sequence.length === 1) {
    summary = `Single-phase activity dominated by ${INCIDENT_PHASE_META[sequence[0].phase].label.toLowerCase()}.`
  } else if (sequence.length > 1) {
    summary = `Activity progressed through ${sequence
      .map((item) => `${INCIDENT_PHASE_META[item.phase].label} (${item.count})`)
      .join(' \u2192 ')}.`
  }

  return { sequence, label, summary, hasData: sequence.length > 0 }
}
