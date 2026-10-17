import { Link } from 'react-router-dom'
import { Globe, Server } from 'lucide-react'

import { INCIDENT_HOST_LIMIT } from '../../constants/incidents.js'

const ROLE_LABEL = { source: 'source', target: 'target', both: 'source + target' }

/**
 * Hosts involved in an incident, linking to their host profile.
 * @param {{hosts?: object[]}} props
 */
function IncidentHosts({ hosts = [] }) {
  const shown = hosts.slice(0, INCIDENT_HOST_LIMIT)
  const hidden = hosts.length - shown.length

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Involved hosts</h2>
      {hosts.length === 0 ? (
        <p className="mt-2 text-xs text-muted">No resolvable IP tuples in this incident.</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {shown.map((host) => (
            <li key={host.ip}>
              <Link
                to={`/hosts/${host.ip}`}
                className="flex items-center justify-between gap-2 rounded px-1.5 py-1.5 text-xs hover:bg-surface-2"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  {host.is_internal ? (
                    <Server className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  )}
                  <span className="font-mono text-text">{host.ip}</span>
                </span>
                <span className="shrink-0 text-muted">
                  {ROLE_LABEL[host.role] ?? host.role} &middot; {host.alert_count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 ? <p className="mt-1 text-xs text-muted">+{hidden} more</p> : null}
    </section>
  )
}

export default IncidentHosts
