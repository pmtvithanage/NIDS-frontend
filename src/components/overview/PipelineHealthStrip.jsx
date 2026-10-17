import { Link } from 'react-router-dom'

import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useSensors } from '../../hooks/useSensors.js'
import { SENSOR_HEALTH } from '../../constants/sensors.js'

const numberFormat = new Intl.NumberFormat('en-GB')
const SENSORS_HREF = '/sensors'

/**
 * Footer strip summarising ingest health across the fleet, each metric linking
 * to the sensor health page.
 */
function PipelineHealthStrip() {
  const query = useSensors()

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={query.refetch} />
  }

  if (query.isLoading || !query.data) {
    return <LoadingSkeleton rows={1} />
  }

  const sensors = query.data.data ?? []
  const online = sensors.filter((sensor) => sensor.health !== SENSOR_HEALTH.OFFLINE).length
  const lag = sensors.reduce((peak, sensor) => Math.max(peak, sensor.kafka_lag ?? 0), 0)
  const errors = sensors.reduce((sum, sensor) => sum + (sensor.ingest_errors ?? 0), 0)
  const orphans = sensors.reduce((sum, sensor) => sum + (sensor.orphan_events ?? 0), 0)

  const metrics = [
    { key: 'online', label: 'Sensors online', value: `${online}/${sensors.length}` },
    { key: 'lag', label: 'Kafka lag (max)', value: numberFormat.format(lag) },
    { key: 'errors', label: 'Ingest errors', value: numberFormat.format(errors) },
    { key: 'orphans', label: 'Orphan events', value: numberFormat.format(orphans) },
  ]

  return (
    <section aria-label="Pipeline health" className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">Pipeline health</h2>
        <Link to={SENSORS_HREF} className="text-xs text-accent hover:underline">
          View sensors
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.key} to={SENSORS_HREF} className="rounded-md px-2 py-1 hover:bg-surface-2">
            <dt className="text-xs text-muted">{metric.label}</dt>
            <dd className="text-lg font-semibold tabular-nums text-text">{metric.value}</dd>
          </Link>
        ))}
      </dl>
    </section>
  )
}

export default PipelineHealthStrip
