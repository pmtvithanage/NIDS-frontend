/**
 * Severity tier constants shared across the console.
 * `severity_tier` is always one of the values in {@link SEVERITY}.
 * @module constants/severity
 */

/** @type {Readonly<Record<string, string>>} */
export const SEVERITY = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
})

/** All severity tiers, ordered from least to most severe. */
export const SEVERITY_ORDER = [
  SEVERITY.LOW,
  SEVERITY.MEDIUM,
  SEVERITY.HIGH,
  SEVERITY.CRITICAL,
]

/** Numeric rank per tier, used for sorting and comparisons. */
export const SEVERITY_RANK = Object.freeze(
  SEVERITY_ORDER.reduce((acc, tier, index) => {
    acc[tier] = index
    return acc
  }, {}),
)

/** Human-readable labels per tier. */
export const SEVERITY_LABEL = Object.freeze({
  [SEVERITY.LOW]: 'Low',
  [SEVERITY.MEDIUM]: 'Medium',
  [SEVERITY.HIGH]: 'High',
  [SEVERITY.CRITICAL]: 'Critical',
})

/** CSS variable names per tier (never rely on color alone in the UI). */
export const SEVERITY_COLOR_VAR = Object.freeze({
  [SEVERITY.LOW]: '--severity-low',
  [SEVERITY.MEDIUM]: '--severity-medium',
  [SEVERITY.HIGH]: '--severity-high',
  [SEVERITY.CRITICAL]: '--severity-critical',
})
