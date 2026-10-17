import { Download, Printer } from 'lucide-react'

import ChartCard from '../components/common/ChartCard.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import ReportIncidents from '../components/reports/ReportIncidents.jsx'
import ReportSummary from '../components/reports/ReportSummary.jsx'
import ReportTopAttackers from '../components/reports/ReportTopAttackers.jsx'
import ReportTopList from '../components/reports/ReportTopList.jsx'
import {
  REPORT_ATTACKER_COLUMNS,
  REPORT_SUMMARY_COLUMNS,
  reportFilename,
} from '../constants/reports.js'
import { useDailyReport } from '../hooks/useReports.js'
import { useUrlState } from '../hooks/useUrlState.js'
import { downloadCsv, toCsv } from '../utils/csv.js'

const TODAY = new Date().toISOString().slice(0, 10)
const REPORT_FILTER_DEFAULTS = { date: TODAY }

const SIGNATURE_COLUMNS = [
  { key: 'signature', label: 'Signature' },
  { key: 'count', label: 'Alerts' },
]

const BUTTON_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-accent'

function buildReportCsv(report) {
  const summaryRows = Object.entries(report.totals).map(([key, value]) => ({ key, value }))
  const summary = toCsv(summaryRows, [
    { key: 'key', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ])
  const attackers = toCsv(report.top_attackers, REPORT_ATTACKER_COLUMNS)
  const signatures = toCsv(
    report.top_signatures.map((entry) => ({ signature: entry.key, count: entry.count })),
    SIGNATURE_COLUMNS,
  )
  const preferences = toCsv([report.totals], REPORT_SUMMARY_COLUMNS)
  return [`Date,${report.date}`, preferences, '', 'Top attackers', attackers, '', 'Top signatures', signatures, '', summary].join('\n')
}

/** Daily security report with print and CSV export. */
function Reports() {
  const [filters, setFilters] = useUrlState(REPORT_FILTER_DEFAULTS)
  const query = useDailyReport(filters.date)
  const report = query.data

  const handleDownload = () => {
    if (!report) return
    downloadCsv(reportFilename(report.date), buildReportCsv(report))
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Reports</h1>
          <p className="text-xs text-muted">Daily detection summary for export and review.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2 no-print">
          <label className="text-xs text-muted">
            Date (UTC)
            <input
              type="date"
              value={filters.date}
              max={TODAY}
              onChange={(event) => setFilters({ date: event.target.value })}
              className="mt-1 block rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <button type="button" className={BUTTON_CLASS} onClick={() => window.print()} disabled={!report}>
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print / Save as PDF
          </button>
          <button type="button" className={BUTTON_CLASS} onClick={handleDownload} disabled={!report}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download CSV
          </button>
        </div>
      </header>

      {query.isLoading ? <LoadingSkeleton rows={8} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}

      {report ? (
        <div id="print-root" className="space-y-4">
          <ReportSummary totals={report.totals} bySeverity={report.by_severity} />

          <ChartCard title={`Top attackers — ${report.date}`} description="Sources with HIGH or CRITICAL activity.">
            <ReportTopAttackers attackers={report.top_attackers} />
          </ChartCard>

          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard title="Top signatures">
              <ReportTopList title="Signatures" items={report.top_signatures} />
            </ChartCard>
            <ChartCard title="Top sources">
              <ReportTopList title="Sources" items={report.top_sources} />
            </ChartCard>
            <ChartCard title="Top destinations">
              <ReportTopList title="Destinations" items={report.top_destinations} />
            </ChartCard>
          </div>

          <ChartCard title="Correlated incidents" description="Incident IDs referenced by this day's alerts.">
            <ReportIncidents incidentIds={report.incidents} />
          </ChartCard>
        </div>
      ) : null}
    </div>
  )
}

export default Reports
