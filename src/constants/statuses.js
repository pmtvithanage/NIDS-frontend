/**
 * Lifecycle status constants for alerts and incidents.
 * @module constants/statuses
 */

/** Alert triage status. */
export const ALERT_STATUS = Object.freeze({
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  TRIAGING: 'triaging',
  INVESTIGATING: 'investigating',
  CONFIRMED: 'confirmed',
  FALSE_POSITIVE: 'false_positive',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
})

/** Incident lifecycle status. */
export const INCIDENT_STATUS = Object.freeze({
  OPEN: 'open',
  TRIAGING: 'triaging',
  CONTAINED: 'contained',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
})

export const ALERT_STATUSES = Object.values(ALERT_STATUS)
export const INCIDENT_STATUSES = Object.values(INCIDENT_STATUS)

/** Human-readable labels per alert status. */
export const ALERT_STATUS_LABEL = Object.freeze({
  [ALERT_STATUS.NEW]: 'New',
  [ALERT_STATUS.ACKNOWLEDGED]: 'Acknowledged',
  [ALERT_STATUS.TRIAGING]: 'Triaging',
  [ALERT_STATUS.INVESTIGATING]: 'Investigating',
  [ALERT_STATUS.CONFIRMED]: 'Confirmed',
  [ALERT_STATUS.FALSE_POSITIVE]: 'False positive',
  [ALERT_STATUS.RESOLVED]: 'Resolved',
  [ALERT_STATUS.DISMISSED]: 'Dismissed',
})

/** Human-readable labels per incident status. */
export const INCIDENT_STATUS_LABEL = Object.freeze({
  [INCIDENT_STATUS.OPEN]: 'Open',
  [INCIDENT_STATUS.TRIAGING]: 'Triaging',
  [INCIDENT_STATUS.CONTAINED]: 'Contained',
  [INCIDENT_STATUS.RESOLVED]: 'Resolved',
  [INCIDENT_STATUS.CLOSED]: 'Closed',
})
