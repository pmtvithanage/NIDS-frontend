import { useMemo } from 'react'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import IncidentsFilters from '../components/incidents/IncidentsFilters.jsx'
import IncidentsTable from '../components/incidents/IncidentsTable.jsx'
import { INCIDENT_FILTER_DEFAULTS } from '../constants/incidents.js'
import { useIncidents } from '../hooks/useIncidents.js'
import { useUrlState } from '../hooks/useUrlState.js'

/** Incidents list: filters plus a table of grouped security incidents. */
function Incidents() {
  const [filters, setFilters, resetFilters] = useUrlState(INCIDENT_FILTER_DEFAULTS)

  const params = useMemo(
    () => ({ severity: filters.severity || undefined, status: filters.status || undefined }),
    [filters.severity, filters.status],
  )
  const query = useIncidents(params)
  const incidents = query.data?.data ?? []
  const total = query.data?.meta?.total ?? incidents.length

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="text-lg font-semibold text-text">Incidents</h1>
        <p className="text-xs text-muted">
          {total} incident{total === 1 ? '' : 's'} {filters.severity || filters.status ? 'matching filters' : 'total'}
        </p>
      </header>

      <IncidentsFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      {query.isLoading ? <LoadingSkeleton rows={6} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {!query.isLoading && !query.isError && incidents.length === 0 ? (
        <EmptyState
          title="No incidents"
          description="Incidents group high-severity alerts that share a source host."
        />
      ) : null}
      {!query.isLoading && !query.isError && incidents.length > 0 ? (
        <IncidentsTable incidents={incidents} />
      ) : null}
    </div>
  )
}

export default Incidents
