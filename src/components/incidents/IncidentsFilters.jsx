import FilterBar from '../common/FilterBar.jsx'
import { SEVERITY_LABEL, SEVERITY_ORDER } from '../../constants/severity.js'
import { INCIDENT_STATUSES, INCIDENT_STATUS_LABEL } from '../../constants/statuses.js'

const SELECT_CLASS =
  'rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent'

/**
 * Incident filter bar (severity + status), synced to the URL by the page.
 * @param {{filters: {severity: string, status: string}, onChange: (patch: object) => void,
 *   onReset: () => void}} props
 */
function IncidentsFilters({ filters, onChange, onReset }) {
  return (
    <FilterBar onClear={onReset}>
      <select
        aria-label="Max severity"
        value={filters.severity}
        onChange={(event) => onChange({ severity: event.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Any severity</option>
        {SEVERITY_ORDER.map((tier) => (
          <option key={tier} value={tier}>
            {SEVERITY_LABEL[tier]}
          </option>
        ))}
      </select>

      <select
        aria-label="Status"
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Any status</option>
        {INCIDENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {INCIDENT_STATUS_LABEL[status]}
          </option>
        ))}
      </select>
    </FilterBar>
  )
}

export default IncidentsFilters
