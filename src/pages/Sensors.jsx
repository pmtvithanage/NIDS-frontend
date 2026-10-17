import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import SensorCard from '../components/sensors/SensorCard.jsx'
import { useSensors } from '../hooks/useSensors.js'

/** Fleet health overview: sensors, ingest lag and orphan decode events. */
function Sensors() {
  const { data, isLoading, isError, error, refetch } = useSensors()
  const sensors = data?.data ?? []

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-text">Sensors</h1>
        <p className="text-xs text-muted">
          Health of the Suricata fleet inferred from Kafka lag, ingest errors and decode orphans.
        </p>
      </header>

      {isLoading ? <LoadingSkeleton rows={6} /> : null}
      {isError ? <ErrorState error={error} onRetry={refetch} /> : null}
      {!isLoading && !isError && sensors.length === 0 ? (
        <EmptyState title="No sensors" description="No sensors are registered with the collector." />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  )
}

export default Sensors
