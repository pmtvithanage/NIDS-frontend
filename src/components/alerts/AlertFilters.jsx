import { useEffect, useRef, useState } from 'react'
import { Download, Loader2, Search } from 'lucide-react'

import FilterBar from '../common/FilterBar.jsx'
import MultiSelect from '../common/MultiSelect.jsx'
import TimeRangePicker from '../common/TimeRangePicker.jsx'
import Toggle from '../common/Toggle.jsx'
import FilterPresets from './FilterPresets.jsx'
import {
  ALERT_DIRECTIONS,
  ALERT_ENGINES,
  ALERT_EVIDENCE_QUALITIES,
  ALERT_SEARCH_DEBOUNCE_MS,
} from '../../constants/alerts.js'
import { LABELS } from '../../constants/labels.js'
import { SEVERITY_LABEL, SEVERITY_ORDER } from '../../constants/severity.js'
import { ALERT_STATUSES, ALERT_STATUS_LABEL } from '../../constants/statuses.js'

const SEVERITY_OPTIONS = SEVERITY_ORDER.map((value) => ({ value, label: SEVERITY_LABEL[value] }))
const STATUS_OPTIONS = ALERT_STATUSES.map((value) => ({ value, label: ALERT_STATUS_LABEL[value] }))

const SELECT_CLASS =
  'rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent'
const INPUT_CLASS = `${SELECT_CLASS} placeholder:text-muted`

/**
 * Full alert filter bar. All controls write back through `onChange` (URL-synced
 * by the page). The free-text input is debounced.
 * @param {{filters: object, onChange: (patch: object) => void, onReset: () => void,
 *   presets: Array, onSavePreset: Function, onApplyPreset: Function, onRemovePreset: Function,
 *   onExport: () => void, exporting: boolean}} props
 */
function AlertFilters({
  filters,
  onChange,
  onReset,
  presets,
  onSavePreset,
  onApplyPreset,
  onRemovePreset,
  onExport,
  exporting,
}) {
  const [search, setSearch] = useState(filters.q)
  const [prevQ, setPrevQ] = useState(filters.q)
  const timer = useRef(null)

  if (filters.q !== prevQ) {
    setPrevQ(filters.q)
    setSearch(filters.q)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  const onSearchChange = (value) => {
    setSearch(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange({ q: value }), ALERT_SEARCH_DEBOUNCE_MS)
  }

  return (
    <FilterBar onClear={onReset}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="alert-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search…  (/)"
          aria-label="Search alerts"
          className={`${INPUT_CLASS} w-48 pl-8`}
        />
      </div>

      <MultiSelect
        label="Severity"
        options={SEVERITY_OPTIONS}
        value={filters.severity}
        onChange={(next) => onChange({ severity: next })}
      />
      <MultiSelect
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(next) => onChange({ status: next })}
      />

      <select
        aria-label="MLP label"
        value={filters.mlp_label}
        onChange={(event) => onChange({ mlp_label: event.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">All labels</option>
        {LABELS.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>

      <select
        aria-label="Direction"
        value={filters.direction}
        onChange={(event) => onChange({ direction: event.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Any direction</option>
        {ALERT_DIRECTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Engine"
        value={filters.engine}
        onChange={(event) => onChange({ engine: event.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Any engine</option>
        {ALERT_ENGINES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Evidence quality"
        value={filters.evidence_quality}
        onChange={(event) => onChange({ evidence_quality: event.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Any evidence</option>
        {ALERT_EVIDENCE_QUALITIES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={filters.signature}
        onChange={(event) => onChange({ signature: event.target.value })}
        placeholder="Signature"
        aria-label="Signature"
        className={`${INPUT_CLASS} w-40`}
      />
      <input
        type="text"
        value={filters.ip}
        onChange={(event) => onChange({ ip: event.target.value })}
        placeholder="IP / CIDR"
        aria-label="IP or CIDR"
        className={`${INPUT_CLASS} w-36`}
      />
      <input
        type="number"
        inputMode="numeric"
        value={filters.dst_port}
        onChange={(event) => onChange({ dst_port: event.target.value })}
        placeholder="Dst port"
        aria-label="Destination port"
        className={`${INPUT_CLASS} w-24`}
      />

      <TimeRangePicker
        value={{ key: filters.range, from: filters.from || null, to: filters.to || null }}
        onChange={(next) => onChange({ range: next.key, from: next.from ?? '', to: next.to ?? '' })}
      />

      <Toggle
        label="Hide likely noise"
        checked={filters.hide_noise}
        onChange={(checked) => onChange({ hide_noise: checked })}
      />
      <Toggle
        label="Hide suppressed"
        checked={filters.hide_suppressed}
        onChange={(checked) => onChange({ hide_suppressed: checked })}
      />

      <FilterPresets
        presets={presets}
        onSave={onSavePreset}
        onApply={onApplyPreset}
        onRemove={onRemovePreset}
      />

      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
      >
        {exporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        Export CSV
      </button>
    </FilterBar>
  )
}

export default AlertFilters
