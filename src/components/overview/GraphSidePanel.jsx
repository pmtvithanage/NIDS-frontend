import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

import SeverityBadge from '../common/SeverityBadge.jsx'
import { useHost } from '../../hooks/useHosts.js'
import { formatRelative } from '../../utils/format.js'

/**
 * Slide-over panel summarising a graph node's host.
 * @param {{node: object|null, onClose: () => void}} props
 */
function GraphSidePanel({ node, onClose }) {
  const { data, isLoading } = useHost(node?.id)

  if (!node) return null
  const host = data ?? node

  return (
    <aside
      aria-label={`Host summary for ${node.id}`}
      className="absolute right-0 top-0 z-10 h-full w-72 overflow-y-auto border-l border-border bg-surface p-3 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold text-text">{node.id}</p>
          <p className="text-xs text-muted">
            {node.is_internal ? 'Internal host' : node.country ? `External · ${node.country}` : 'External host'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close host summary"
          className="rounded-md border border-border p-1 text-muted hover:bg-surface-2"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3">
        <SeverityBadge tier={host.max_severity} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted">Alerts</dt>
          <dd className="font-medium text-text">{node.alert_count ?? host.alert_count ?? 0}</dd>
        </div>
        {host.org ? (
          <div>
            <dt className="text-muted">ASN</dt>
            <dd className="font-medium text-text">{host.asn ?? '-'}</dd>
          </div>
        ) : null}
        {host.last_seen ? (
          <div className="col-span-2">
            <dt className="text-muted">Last seen</dt>
            <dd className="font-medium text-text">{formatRelative(host.last_seen)}</dd>
          </div>
        ) : null}
      </dl>

      {isLoading ? <p className="mt-3 text-xs text-muted">Loading host detail…</p> : null}

      <Link
        to={`/hosts/${encodeURIComponent(node.id)}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-accent hover:bg-surface-2"
      >
        Open host page
      </Link>
    </aside>
  )
}

export default GraphSidePanel






























