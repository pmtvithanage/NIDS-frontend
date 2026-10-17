import OrphanEventsList from './OrphanEventsList.jsx'
import SensorHealthBadge from './SensorHealthBadge.jsx'
import { formatTs } from '../../utils/format.js'

function Metric({ label, value, alert = false }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`tabular-nums ${alert ? 'text-sev-medium' : 'text-text'}`}>{value}</dd>
    </div>
  )
}

/**
 * Fleet sensor card: identity, health verdict, ingest metrics and orphan events.
 * @param {{sensor: object}} props
 */
function SensorCard({ sensor }) {
  const active = sensor.health !== 'offline'
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text">{sensor.name}</h2>
          <p className="text-xs text-muted">
            {sensor.role} &middot; {sensor.location} &middot; {sensor.version}
          </p>
        </div>
        <SensorHealthBadge health={sensor.health} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Metric label="Last seen" value={formatTs(sensor.last_seen)} />
        <Metric label="Events / min" value={active ? sensor.events_per_min : '—'} />
        <Metric label="Kafka lag" value={sensor.kafka_lag} alert={sensor.kafka_lag > 100} />
        <Metric label="Ingest errors" value={sensor.ingest_errors} alert={sensor.ingest_errors > 10} />
        <Metric label="Orphan events" value={sensor.orphan_events} alert={sensor.orphan_events > 25} />
      </dl>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Recent orphan events</p>
        <OrphanEventsList events={sensor.orphan_event_list} />
      </div>
    </section>
  )
}

export default SensorCard
