import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import SeverityBadge from '../components/common/SeverityBadge.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import IncidentHosts from '../components/incidents/IncidentHosts.jsx'
import IncidentPhaseSummary from '../components/incidents/IncidentPhaseSummary.jsx'
import IncidentTimeline from '../components/incidents/IncidentTimeline.jsx'
import { useIncident } from '../hooks/useIncidents.js'
import { formatTs } from '../utils/format.js'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className="text-right text-text">{value}</span>
    </div>
  )
}

/** Single incident detail: header, phase summary, timeline and involved hosts. */
function IncidentDetail() {
  const { id } = useParams()
  const { data: incident, isLoading, isError, error, refetch } = useIncident(id)

  return (
    <div className="space-y-4">
      <Link to="/incidents" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to incidents
      </Link>

      {isLoading ? <LoadingSkeleton rows={8} /> : null}
      {isError ? <ErrorState error={error} onRetry={refetch} /> : null}
      {!isLoading && !isError && !incident ? (
        <EmptyState title="Incident not found" description={`No incident matches id ${id}.`} />
      ) : null}

      {incident ? (
        <>
          <header className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge tier={incident.severity_tier} />
              <StatusBadge status={incident.status} kind="incident" />
              <span className="text-xs text-muted">{incident.alert_count} alerts</span>
            </div>
            <h1 className="mt-2 text-lg font-semibold text-text">{incident.title}</h1>
            <p className="font-mono text-xs text-muted">{incident.id}</p>

            <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <Fact label="First seen" value={formatTs(incident.first_seen)} />
              <Fact label="Last seen" value={formatTs(incident.last_seen)} />
              <Fact label="Primary source" value={incident.primary_src_ip ?? '—'} />
              <Fact label="Primary target" value={incident.primary_dst_ip ?? '—'} />
              <Fact label="Top signature" value={incident.top_signature ?? '—'} />
              <Fact label="Labels" value={incident.mlp_labels?.join(', ') || '—'} />
              <Fact label="Sensor" value={incident.sensor ?? '—'} />
              <Fact label="Assignee" value={incident.assignee ?? 'Unassigned'} />
            </div>
          </header>

          <IncidentPhaseSummary timeline={incident.timeline} />

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <IncidentTimeline timeline={incident.timeline} />
            </div>
            <IncidentHosts hosts={incident.hosts} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default IncidentDetail
