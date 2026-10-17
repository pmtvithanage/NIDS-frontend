import { Link } from 'react-router-dom'
import { Activity, AlertOctagon, Server, ShieldAlert, Timer } from 'lucide-react'

import ErrorState from '../common/ErrorState.jsx'
import KpiTile from '../common/KpiTile.jsx'
import { useSensors } from '../../hooks/useSensors.js'
import { useSummary } from '../../hooks/useStats.js'
import { SENSOR_HEALTH } from '../../constants/sensors.js'
import { formatDuration } from '../../utils/format.js'
import {
  buildRangeHref,
  CRITICAL_LOW_EVIDENCE_HREF,
  CRITICAL_UNREVIEWED_HREF,
} from '../../utils/overview.js'

const KPI_TILE_COUNT = 5
const MICROSECONDS_PER_SECOND = 1_000_000

/**
 * Top-row KPI tiles for the active window: alert volume (with period-over-
 * period trend), unreviewed CRITICAL alerts, CRITICAL alerts with weak
 * evidence, mean time to triage and the online sensor ratio.
 * @param {{from?: string|null, to?: string|null}} props Active time window.
 */
function OverviewKpis({ from, to }) {
  const summary = useSummary({ from, to })
  const sensors = useSensors()

  if (summary.isError) {
    return <ErrorState error={summary.error} onRetry={summary.refetch} />
  }

  if (summary.isLoading || !summary.data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: KPI_TILE_COUNT }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg bg-surface-2" />
        ))}
      </div>
    )
  }

  const data = summary.data
  const trend =
    data.previous_total_alerts > 0
      ? Math.round(
          ((data.total_alerts - data.previous_total_alerts) / data.previous_total_alerts) * 100,
        )
      : undefined

  const sensorList = sensors.data?.data ?? []
  const online = sensorList.filter((sensor) => sensor.health !== SENSOR_HEALTH.OFFLINE).length
  const sensorsValue = sensorList.length ? `${online}/${sensorList.length}` : '—'

  const triageValue =
    data.mean_triage_seconds != null
      ? formatDuration(data.mean_triage_seconds * MICROSECONDS_PER_SECOND)
      : '—'

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Link to={buildRangeHref(from, to)} className="block">
        <KpiTile
          label="Alerts in range"
          value={data.total_alerts}
          hint="vs. previous period"
          trend={trend}
          icon={Activity}
        />
      </Link>
      <Link to={CRITICAL_UNREVIEWED_HREF} className="block">
        <KpiTile
          label="Critical unreviewed"
          value={data.critical_unreviewed}
          hint="still in status New"
          icon={AlertOctagon}
        />
      </Link>
      <Link to={CRITICAL_LOW_EVIDENCE_HREF} className="block">
        <KpiTile
          label="Critical, low evidence"
          value={data.critical_low_evidence}
          hint="weak signature + MLP"
          icon={ShieldAlert}
        />
      </Link>
      <KpiTile
        label="Mean time to triage"
        value={triageValue}
        hint="first review (proxy)"
        icon={Timer}
      />
      <KpiTile
        label="Sensors online"
        value={sensorsValue}
        hint="of registered sensors"
        icon={Server}
      />
    </div>
  )
}

export default OverviewKpis
