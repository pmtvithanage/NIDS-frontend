import { Link } from 'react-router-dom'

import { formatTs } from '../../utils/format.js'

/**
 * List of Suricata events without an IP tuple (decode orphans) for a sensor.
 * @param {{events?: object[]}} props
 */
function OrphanEventsList({ events = [] }) {
  if (events.length === 0) {
    return <p className="text-xs text-muted">No orphan events in the recent window.</p>
  }

  return (
    <ul className="space-y-1">
      {events.map((event) => (
        <li key={event.id} className="flex items-center justify-between gap-2 text-xs">
          <Link to={`/alerts/${event.id}`} className="font-mono text-accent hover:underline">
            {event.id}
          </Link>
          <span className="uppercase text-muted">{event.protocol}</span>
          <span className="flex-1 truncate text-muted" title={event.signature}>
            {event.signature}
          </span>
          <span className="whitespace-nowrap tabular-nums text-muted">{formatTs(event.ts)}</span>
        </li>
      ))}
    </ul>
  )
}

export default OrphanEventsList
