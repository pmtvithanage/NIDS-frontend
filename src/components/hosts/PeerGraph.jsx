import { Link } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'
import {
  HOST_PEER_LIMIT,
  PEER_GRAPH_CENTER,
  PEER_GRAPH_CORE_RADIUS,
  PEER_GRAPH_MAX_NODE_RADIUS,
  PEER_GRAPH_MIN_NODE_RADIUS,
  PEER_GRAPH_ORBIT_RADIUS,
  PEER_GRAPH_SIZE,
} from '../../constants/hosts.js'

function layout(peers) {
  const max = peers.reduce((m, peer) => Math.max(m, peer.count), 1)
  return peers.map((peer, index) => {
    const angle = (2 * Math.PI * index) / peers.length - Math.PI / 2
    const ratio = peer.count / max
    return {
      ...peer,
      x: PEER_GRAPH_CENTER + PEER_GRAPH_ORBIT_RADIUS * Math.cos(angle),
      y: PEER_GRAPH_CENTER + PEER_GRAPH_ORBIT_RADIUS * Math.sin(angle),
      radius:
        PEER_GRAPH_MIN_NODE_RADIUS +
        (PEER_GRAPH_MAX_NODE_RADIUS - PEER_GRAPH_MIN_NODE_RADIUS) * ratio,
    }
  })
}

/**
 * Simple SVG node-link graph of hosts that exchange traffic with this host,
 * plus a legend list. No external graph library.
 * @param {{ip: string, peers?: Array<{key: string, count: number}>}} props
 */
function PeerGraph({ ip, peers = [] }) {
  const nodes = layout(peers.slice(0, HOST_PEER_LIMIT))

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Peer graph</h2>
      {nodes.length === 0 ? (
        <EmptyState title="No peers" description="No other hosts exchanged traffic with this one." />
      ) : (
        <>
          <svg
            viewBox={`0 0 ${PEER_GRAPH_SIZE} ${PEER_GRAPH_SIZE}`}
            className="mx-auto mt-2 h-64 w-full max-w-sm"
            role="img"
            aria-label={`Peers of ${ip}`}
          >
            {nodes.map((node) => (
              <line
                key={`edge-${node.key}`}
                x1={PEER_GRAPH_CENTER}
                y1={PEER_GRAPH_CENTER}
                x2={node.x}
                y2={node.y}
                stroke="var(--border)"
                strokeWidth={1 + Math.min(node.count, 8) * 0.5}
              />
            ))}
            <circle
              cx={PEER_GRAPH_CENTER}
              cy={PEER_GRAPH_CENTER}
              r={PEER_GRAPH_CORE_RADIUS}
              fill="var(--accent)"
            />
            <text
              x={PEER_GRAPH_CENTER}
              y={PEER_GRAPH_CENTER + 4}
              textAnchor="middle"
              fill="var(--accent-fg)"
              fontSize={11}
              fontWeight={600}
            >
              host
            </text>
            {nodes.map((node) => (
              <g key={`node-${node.key}`}>
                <circle cx={node.x} cy={node.y} r={node.radius} fill="var(--surface-2)" stroke="var(--accent)" />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fill="var(--muted)" fontSize={9}>
                  {node.count}
                </text>
              </g>
            ))}
          </svg>

          <ul className="mt-2 space-y-1">
            {nodes.map((node) => (
              <li key={node.key}>
                <Link
                  to={`/hosts/${node.key}`}
                  className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs hover:bg-surface-2"
                >
                  <span className="font-mono text-text">{node.key}</span>
                  <span className="tabular-nums text-muted">{node.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default PeerGraph
