/**
 * Alerts page constants: filter defaults, page size, virtualization metrics
 * and CSV export columns.
 * @module constants/alerts
 */

import { DEFAULT_TIME_RANGE } from './time.js'

/** Cursor page size requested from the alerts API. */
export const ALERT_PAGE_SIZE = 25

/** Fixed row height (px) used by the virtualizer. */
export const ALERT_ROW_HEIGHT = 52

/** Debounce for the free-text search input (ms). */
export const ALERT_SEARCH_DEBOUNCE_MS = 300

/** Default sort expression (field:direction) sent to the API. */
export const ALERT_DEFAULT_SORT = 'ts:desc'

/** Interval at which preset time windows are recomputed (ms). */
export const ALERT_WINDOW_REFRESH_MS = 60_000

/** Maximum interval before buffered live alerts are flushed into state (ms). */
export const ALERT_LIVE_BATCH_MS = 500

/** Flow direction options. */
export const ALERT_DIRECTIONS = Object.freeze([
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'internal', label: 'Internal' },
])

/** Detection engine options. */
export const ALERT_ENGINES = Object.freeze([
  { value: 'suricata', label: 'Suricata' },
  { value: 'mlp', label: 'MLP classifier' },
  { value: 'ae', label: 'Autoencoder' },
])

/** Evidence-quality options (values match the API's `evidence_quality`). */
export const ALERT_EVIDENCE_QUALITIES = Object.freeze([
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
])

/** Default filter state; also defines the URL query-string schema. */
export const ALERT_FILTER_DEFAULTS = Object.freeze({
  severity: [],
  status: [],
  mlp_label: '',
  direction: '',
  engine: '',
  evidence_quality: '',
  ip: '',
  dst_port: '',
  signature: '',
  q: '',
  range: DEFAULT_TIME_RANGE,
  from: '',
  to: '',
  hide_noise: false,
  hide_suppressed: false,
  sort: ALERT_DEFAULT_SORT,
  limit: ALERT_PAGE_SIZE,
})

/** Human label options offered in the alert label dialog. */
export const HUMAN_LABEL_OPTIONS = Object.freeze([
  'BENIGN',
  'DDoS',
  'PortScan',
  'Bot',
  'WebAttack',
  'Other',
])

/** Number of top anomalous features returned by `/alerts/:id/explain`. */
export const ANOMALY_TOP_FEATURES = 8

/** Sentinel written by CICFlowMeter when a TCP window size is not applicable. */
export const FLOW_NULL_SENTINEL = -1

/** Related-alert correlation window (`+/-` this many ms around the alert). */
export const RELATED_ALERTS_WINDOW_MS = 3_600_000

/** Maximum number of related alerts listed. */
export const RELATED_ALERTS_LIMIT = 8

/** Absolute z-score above which a flow feature is highlighted as anomalous. */
export const ANOMALY_Z_THRESHOLD = 3

/** Columns included in the CSV export (keys match flattened rows). */
export const ALERT_EXPORT_COLUMNS = Object.freeze([
  { key: 'id', label: 'id' },
  { key: 'ts', label: 'timestamp' },
  { key: 'severity', label: 'severity' },
  { key: 'status', label: 'status' },
  { key: 'src_ip', label: 'src_ip' },
  { key: 'dst_ip', label: 'dst_ip' },
  { key: 'dst_port', label: 'dst_port' },
  { key: 'protocol', label: 'protocol' },
  { key: 'direction', label: 'direction' },
  { key: 'mlp_label', label: 'mlp_label' },
  { key: 'mlp_confidence', label: 'mlp_confidence' },
  { key: 'ae_ratio', label: 'ae_ratio' },
  { key: 'signature', label: 'suricata_signature' },
  { key: 'evidence_score', label: 'evidence_score' },
  { key: 'assignee', label: 'assignee' },
  { key: 'suppressed', label: 'suppressed' },
])
