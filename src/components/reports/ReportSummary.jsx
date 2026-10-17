import KpiTile from '../common/KpiTile.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { SEVERITY_ORDER } from '../../constants/severity.js'

/**
 * Daily report summary: totals plus severity breakdown.
 * @param {{totals?: object, bySeverity?: Record<string, number>}} props
 */
function ReportSummary({ totals = {}, bySeverity = {} }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiTile label="Alerts" value={totals.alerts ?? 0} />
        <KpiTile label="Incidents" value={totals.incidents ?? 0} />
        <KpiTile label="Malicious" value={totals.malicious ?? 0} />
        <KpiTile label="Benign" value={totals.benign ?? 0} />
        <KpiTile label="Noise ratio" value={Math.round((totals.noise_ratio ?? 0) * 1000) / 10 + '%'} />
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3">
        {SEVERITY_ORDER.map((tier) => (
          <div key={tier} className="flex items-center gap-2">
            <SeverityBadge tier={tier} />
            <span className="tabular-nums text-sm text-muted">{bySeverity[tier] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReportSummary
