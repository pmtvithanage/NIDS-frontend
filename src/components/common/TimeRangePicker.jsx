import { TIME_RANGES } from '../../constants/time.js'

function toLocalInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function fromLocalInput(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * Preset time-range picker with custom from/to inputs.
 * @param {{value?: {key:string, from?:string|null, to?:string|null}, onChange: (next: object) => void, className?: string}} props
 */
function TimeRangePicker({ value = { key: '24h' }, onChange, className = '' }) {
  const select = (key) => {
    if (key === 'custom') onChange({ key, from: value.from ?? null, to: value.to ?? null })
    else onChange({ key })
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <div className="inline-flex overflow-hidden rounded-md border border-border">
        {TIME_RANGES.map((range) => (
          <button
            key={range.key}
            type="button"
            aria-pressed={value.key === range.key}
            onClick={() => select(range.key)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              value.key === range.key
                ? 'bg-accent text-accent-fg'
                : 'bg-surface text-muted hover:text-text'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      {value.key === 'custom' ? (
        <div className="flex items-center gap-1.5">
          <input
            type="datetime-local"
            aria-label="From"
            value={toLocalInput(value.from)}
            onChange={(event) =>
              onChange({ key: 'custom', from: fromLocalInput(event.target.value), to: value.to ?? null })
            }
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text"
          />
          <span className="text-xs text-muted">to</span>
          <input
            type="datetime-local"
            aria-label="To"
            value={toLocalInput(value.to)}
            onChange={(event) =>
              onChange({ key: 'custom', from: value.from ?? null, to: fromLocalInput(event.target.value) })
            }
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text"
          />
        </div>
      ) : null}
    </div>
  )
}

export default TimeRangePicker
