import { TrendingDown, TrendingUp } from 'lucide-react'

/**
 * KPI summary tile.
 * @param {{label: string, value: import('react').ReactNode, hint?: string,
 *   icon?: Function, trend?: number, className?: string}} props
 */
function KpiTile({ label, value, hint, icon: Icon, trend, className = '' }) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted" aria-hidden="true" /> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums text-text">{value}</p>
        {typeof trend === 'number' ? (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend >= 0 ? 'text-sev-high' : 'text-sev-low'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            )}
            {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export default KpiTile
