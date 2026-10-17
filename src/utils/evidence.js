/**
 * Evidence scoring and noise heuristics for fusion alerts.
 * Implements the evidence score formula described in doc section 6.5.
 *
 * The "likely noise" cutoffs are read from the user's detection settings
 * (localStorage) on every call, so adjusting them in Settings takes effect.
 * @module utils/evidence
 */

import { DEFAULT_MLP_NOISE_CUTOFF, DEFAULT_SIGNATURE_WEIGHT_CUTOFF } from '../constants/settings.js'
import { readDetectionSettings } from './settings.js'

/** Weight of the Suricata component in the evidence score. */
export const EVIDENCE_WEIGHT_SURICATA = 0.45
/** Weight of the MLP component in the evidence score. */
export const EVIDENCE_WEIGHT_MLP = 0.35
/** Weight of the autoencoder component in the evidence score. */
export const EVIDENCE_WEIGHT_AE = 0.2

/** AE ratio considered saturating for scoring purposes. */
export const AE_RATIO_REFERENCE = 50

/** Default Suricata weight below which a signature is considered weak. */
export const NOISE_SURICATA_WEIGHT = DEFAULT_SIGNATURE_WEIGHT_CUTOFF
/** Default MLP confidence below which a detection is considered uncertain. */
export const NOISE_MLP_CONFIDENCE = DEFAULT_MLP_NOISE_CUTOFF

/** Quality thresholds for the evidence score (0-100). */
export const EVIDENCE_QUALITY_HIGH = 66
export const EVIDENCE_QUALITY_MEDIUM = 33

/** Per-category Suricata signature weight (0-1). */
const CATEGORY_WEIGHT = Object.freeze({
  checksum: 0.12,
  decode: 0.15,
  'protocol-command-decode': 0.15,
  'misc-activity': 0.18,
  scan: 0.45,
  'attempted-recon': 0.35,
  'attempted-admin': 0.6,
  dos: 0.75,
  ddos: 0.8,
  'trojan-activity': 0.7,
  malware: 0.7,
  'web-application-attack': 0.65,
  'brute-force': 0.55,
  'policy-violation': 0.25,
})

const DEFAULT_CATEGORY_WEIGHT = 0.3

/**
 * Map a Suricata signature category to a 0-1 weight.
 * @param {string} [category] Suricata category.
 * @returns {number} Weight in [0, 1].
 */
export function signatureWeight(category) {
  return CATEGORY_WEIGHT[category] ?? DEFAULT_CATEGORY_WEIGHT
}

/**
 * Compute the evidence score (0-100) from the three engine signals.
 * @param {{ suricataWeight?: number, mlpConfidence?: number, aeRatio?: number }} signals
 * @returns {number} Rounded evidence score.
 */
export function evidenceScore({ suricataWeight = 0, mlpConfidence = 0, aeRatio = 0 }) {
  const aeComponent = Math.min(Math.max(aeRatio, 0) / AE_RATIO_REFERENCE, 1)
  const score =
    EVIDENCE_WEIGHT_SURICATA * suricataWeight +
    EVIDENCE_WEIGHT_MLP * mlpConfidence +
    EVIDENCE_WEIGHT_AE * aeComponent
  return Math.round(score * 100 * 100) / 100
}

/**
 * Bucket an evidence score into a quality label.
 * @param {number} score Evidence score (0-100).
 * @returns {'low'|'medium'|'high'}
 */
export function evidenceQuality(score) {
  if (score >= EVIDENCE_QUALITY_HIGH) return 'high'
  if (score >= EVIDENCE_QUALITY_MEDIUM) return 'medium'
  return 'low'
}

/**
 * "likely noise" rule: weak Suricata signature AND uncertain MLP output.
 * Cutoffs are read from the user's detection settings (Settings →
 * Detection thresholds), defaulting to the constants above.
 * @param {{ suricataWeight?: number, mlpConfidence?: number }} signals
 * @returns {boolean} True when the alert is likely noise.
 */
export function isLikelyNoise({ suricataWeight = 0, mlpConfidence = 0 }) {
  const { mlpNoiseCutoff, signatureWeightCutoff } = readDetectionSettings()
  return suricataWeight < signatureWeightCutoff && mlpConfidence < mlpNoiseCutoff
}
