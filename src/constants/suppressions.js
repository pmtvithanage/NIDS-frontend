/**
 * Suppressions page constants: severity options and dialog field hints.
 * @module constants/suppressions
 */

import { SEVERITY_LABEL, SEVERITY_ORDER } from './severity.js'

/** Max-severity options for a rule (empty = no cap). */
export const MAX_SEVERITY_OPTIONS = Object.freeze([
  { value: '', label: 'Any severity' },
  ...SEVERITY_ORDER.map((tier) => ({ value: tier, label: `Up to ${SEVERITY_LABEL[tier]}` })),
])

/** Human-readable hint shown for the CIDR inputs. */
export const CIDR_HINT = 'IPv4 block, e.g. 192.168.8.0/24 (blank = any)'

/** Number of alerts previewed by the dry-run. */
export const DRY_RUN_SAMPLE_LIMIT = 5
