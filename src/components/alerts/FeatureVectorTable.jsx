import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'

import { ANOMALY_Z_THRESHOLD } from '../../constants/alerts.js'
import { formatFeatureValue } from '../../utils/flow.js'

const SORTS = [
  { key: 'z_desc', label: 'z-score ↓' },
  { key: 'z_asc', label: 'z-score ↑' },
  { key: 'name', label: 'Name' },
]

function formatValue(value) {
  if (typeof value !== 'number') return formatFeatureValue(value)
  return Number.isInteger(value) ? value.toLocaleString('en-US') : value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })
}

/**
 * Collapsible 78-column feature vector table with search and z-score sorting.
 * @param {{vector: object, zScores?: object}} props
 */
function FeatureVectorTable({ vector = {}, zScores = {} }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('z_desc')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const entries = Object.keys(vector)
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map((name) => ({ name, value: vector[name], z: zScores[name] ?? 0 }))
    if (sort === 'name') return entries.sort((a, b) => a.name.localeCompare(b.name))
    const factor = sort === 'z_asc' ? 1 : -1
    return entries.sort((a, b) => (Math.abs(a.z) - Math.abs(b.z)) * factor)
  }, [vector, zScores, query, sort])

  return (
    <section className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-4 py-3 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-text">Feature vector</span>
        <span className="text-xs text-muted">({Object.keys(vector).length} columns)</span>
      </button>

      {open ? (
        <div className="space-y-2 border-t border-border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search columns…"
                aria-label="Search feature columns"
                className="w-56 rounded-md border border-border bg-surface pl-8 pr-2 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              {SORTS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSort(option.key)}
                  aria-pressed={sort === option.key}
                  className={`px-2.5 py-1 text-xs ${
                    sort === option.key ? 'bg-accent text-accent-fg' : 'bg-surface text-muted hover:text-text'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted">{rows.length} shown</span>
          </div>

          <div className="max-h-96 overflow-auto rounded-md border border-border">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-surface-2">
                <tr className="text-left text-muted">
                  <th scope="col" className="px-3 py-1.5 font-medium">Feature</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-medium">Value</th>
                  <th scope="col" className="px-3 py-1.5 text-right font-medium">z-score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-t border-border hover:bg-surface-2/50">
                    <td className="px-3 py-1 text-text">{row.name}</td>
                    <td className="px-3 py-1 text-right tabular-nums text-muted">
                      {formatValue(row.value)}
                    </td>
                    <td
                      className={`px-3 py-1 text-right tabular-nums ${
                        Math.abs(row.z) >= ANOMALY_Z_THRESHOLD ? 'text-sev-high' : 'text-muted'
                      }`}
                    >
                      {row.z}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default FeatureVectorTable
