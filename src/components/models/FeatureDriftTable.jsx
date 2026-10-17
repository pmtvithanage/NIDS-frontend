import { ArrowDown, ArrowUp, Minus, TriangleAlert } from 'lucide-react'

import EmptyState from '../common/EmptyState.jsx'

const DIRECTION_ICON = { up: ArrowUp, down: ArrowDown, stable: Minus }
const DRIFT_TOLERANCE = 0.001

function formatPercent(value) {
  return `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`
}

/**
 * Feature drift table: recent-window mean vs baseline mean.
 * @param {{rows?: Array<{feature: string, mean: number, baseline: number, drift: number, direction: string, drifted: boolean}>}} props
 */
function FeatureDriftTable({ rows = [] }) {
  if (rows.length === 0) {
    return <EmptyState title="No drift data" description="Not enough alerts to compare windows." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Feature</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Baseline</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Current</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Drift</th>
            <th scope="col" className="py-2 font-medium">Flag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const Icon = DIRECTION_ICON[row.direction] ?? Minus
            const flat = Math.abs(row.drift) < DRIFT_TOLERANCE
            return (
              <tr key={row.feature} className="border-b border-border last:border-0">
                <td className="py-2 pr-3 text-text">{row.feature}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-muted">{row.baseline}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-muted">{row.mean}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-muted">
                  <span className="inline-flex items-center justify-end gap-1">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {flat ? '0%' : formatPercent(row.drift)}
                  </span>
                </td>
                <td className="py-2">
                  {row.drifted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-sev-high">
                      <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      drifted
                    </span>
                  ) : (
                    <span className="text-xs text-muted">stable</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default FeatureDriftTable
