/**
 * Communication graph ("who talks to whom") constants.
 * @module constants/graph
 */

/** Default look-back window (minutes) for the graph and its API call. */
export const GRAPH_DEFAULT_MINUTES = 15

/** Auto-refresh interval (ms) for the communication graph. */
export const GRAPH_REFRESH_MS = 15_000

/** Maximum number of nodes rendered; extra nodes are truncated (top by alert count). */
export const GRAPH_NODE_LIMIT = 60

/** Horizontal x position for internal (left) and external (right) node columns. */
export const GRAPH_COLUMN_X = Object.freeze({ internal: 60, external: 460 })

/** Vertical spacing (px) between stacked nodes in a column. */
export const GRAPH_ROW_GAP = 68

/** Edge stroke width range (px), scaled by flow count. */
export const GRAPH_EDGE_WIDTH = Object.freeze({ min: 1.5, max: 7 })

/** Severity chip text (kept short so the node stays compact). */
export const GRAPH_SEVERITY_CHIP = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MED',
  HIGH: 'HIGH',
  CRITICAL: 'CRIT',
})

/** Alias mapping severity tier -> text color token. */
export const GRAPH_SEVERITY_CLASS = Object.freeze({
  LOW: 'text-sev-low',
  MEDIUM: 'text-sev-medium',
  HIGH: 'text-sev-high',
  CRITICAL: 'text-sev-critical',
})

/** Border color for nodes/edges per tier, via CSS variables. */
export const GRAPH_SEVERITY_VAR = Object.freeze({
  LOW: 'var(--sev-low)',
  MEDIUM: 'var(--sev-medium)',
  HIGH: 'var(--sev-high)',
  CRITICAL: 'var(--sev-critical)',
})

/** Number of rows shown in the accessible "View as table" alternative. */
export const GRAPH_TABLE_ROWS = 20
