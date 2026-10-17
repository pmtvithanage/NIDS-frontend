/**
 * Host detail page constants: chart/list limits and peer-graph geometry.
 * @module constants/hosts
 */

/** Maximum ports plotted in the "ports contacted" bar chart. */
export const HOST_PORT_LIMIT = 10

/** Maximum peers rendered in the node-link graph. */
export const HOST_PEER_LIMIT = 10

/** Peer-graph layout (viewBox units). */
export const PEER_GRAPH_SIZE = 320
export const PEER_GRAPH_CENTER = PEER_GRAPH_SIZE / 2
export const PEER_GRAPH_ORBIT_RADIUS = 118
export const PEER_GRAPH_CORE_RADIUS = 26
export const PEER_GRAPH_MIN_NODE_RADIUS = 6
export const PEER_GRAPH_MAX_NODE_RADIUS = 18
