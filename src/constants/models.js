/**
 * Model insights constants: feature-drift table, fusion review and sampling.
 * @module constants/models
 */

/** Number of alerts sampled when computing feature drift. */
export const MODEL_FEATURE_SAMPLE = 160

/** Relative change (current vs baseline mean) that flags a feature as drifted. */
export const DRIFT_FLAG_RATIO = 0.2

/** Features shown in the drift table (interpretable, numeric). */
export const MODEL_DRIFT_FEATURES = Object.freeze([
  'Flow Duration',
  'Flow Bytes/s',
  'Flow Packets/s',
  'Total Fwd Packets',
  'Total Backward Packets',
  'Average Packet Size',
  'Fwd Packet Length Mean',
  'Bwd Packet Length Mean',
  'Flow IAT Mean',
  'SYN Flag Count',
  'Destination Port',
  'Packet Length Mean',
])

/** Number of example alerts listed in the fusion review. */
export const FUSION_EXAMPLE_LIMIT = 5

/** Signal strength at/above which an engine counts as a CRITICAL driver. */
export const FUSION_SURICATA_STRONG = 0.6
export const FUSION_MLP_STRONG = 0.85
export const FUSION_AE_STRONG = 100

/** Upper bound below which a lone driver is considered "weak". */
export const FUSION_SURICATA_WEAK = 0.75
export const FUSION_MLP_WEAK = 0.92
export const FUSION_AE_WEAK = 500

/** Engine identifiers used across the fusion review. */
export const FUSION_ENGINES = Object.freeze(['suricata', 'mlp', 'ae'])

/** Number of day buckets shown in the precision/recall over time chart. */
export const PRECISION_BUCKET_DAYS = 7

/** AE error ratio at/above which the autoencoder counts as having fired. */
export const DETECTION_AE_RATIO = 1

/** Engine display names. */
export const ENGINE_LABELS = Object.freeze({
  suricata: 'Suricata',
  mlp: 'MLP',
  ae: 'Autoencoder',
})

/** Line colors per engine. */
export const ENGINE_COLORS = Object.freeze({
  suricata: 'var(--accent)',
  mlp: 'var(--sev-medium)',
  ae: 'var(--sev-high)',
})
