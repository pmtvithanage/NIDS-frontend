/**
 * Plain-language explanations of why an alert scored as low-evidence noise.
 * @module utils/evidenceNarrative
 */

import { readDetectionSettings } from './settings.js'

/**
 * Whether the alert should surface the "low evidence" banner.
 * @param {object|null} detail Alert detail object.
 * @returns {boolean}
 */
export function isLowEvidence(detail) {
  if (!detail) return false
  return Boolean(detail.likely_benign) || detail.evidence_quality === 'low'
}

/**
 * Explain in plain language which weak signals produced a low-evidence alert.
 * @param {object|null} detail Alert detail object.
 * @returns {string} Sentence suitable for the banner.
 */
export function lowEvidenceReason(detail) {
  if (!detail) return ''
  const signature = detail.engines?.suricata
  const mlp = detail.engines?.mlp
  const { mlpNoiseCutoff, signatureWeightCutoff } = readDetectionSettings()
  const parts = []

  if (signature) {
    const weight = signature.weight ?? 0
    const category = signature.category ?? 'decode'
    const descriptor =
      weight < signatureWeightCutoff
        ? `only a ${category} signature (weight ${weight.toFixed(2)})`
        : `a ${category} signature (weight ${weight.toFixed(2)})`
    parts.push(descriptor)
  }

  if (mlp) {
    const confidence = mlp.confidence ?? 0
    const pct = Math.round(confidence * 100)
    parts.push(
      confidence < mlpNoiseCutoff
        ? `MLP confidence below ${Math.round(mlpNoiseCutoff * 100)}% (${pct}%)`
        : `MLP confidence ${pct}%`,
    )
  }

  const anchor = parts.length ? parts.join(' and ') : 'weak signals across the engines'
  return `This alert rests on ${anchor}. Treat it as possible artifact noise until corroborated.`
}
