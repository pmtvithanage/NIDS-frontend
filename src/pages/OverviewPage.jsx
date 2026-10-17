import { useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import TimeRangePicker from '../components/common/TimeRangePicker.jsx'
import OverviewKpis from '../components/overview/OverviewKpis.jsx'
import LiveMonitor from '../components/overview/live/LiveMonitor.jsx'
import AlertsOverTimeChart from '../components/overview/AlertsOverTimeChart.jsx'
import SeverityDonut from '../components/overview/SeverityDonut.jsx'
import TopListCard from '../components/overview/TopListCard.jsx'
import EngineAgreementChart from '../components/overview/EngineAgreementChart.jsx'
import LatestAlertTicker from '../components/overview/LatestAlertTicker.jsx'
import PipelineHealthStrip from '../components/overview/PipelineHealthStrip.jsx'
import CommunicationGraphWrapper from '../components/overview/CommunicationGraphWrapper.jsx'
import { useTimeWindow } from '../hooks/useTimeWindow.js'
import { useSummary } from '../hooks/useStats.js'
import { OVERVIEW_TOP_LISTS } from '../constants/overview.js'
import { DEFAULT_TIME_RANGE } from '../constants/time.js'
import { formatTs } from '../utils/format.js'

/**
 * Console landing page: fleet KPIs, the live monitoring panel, historical
 * alert charts and ranked breakdowns, plus a pipeline-health footer.
 */
function OverviewPage() {
  const [range, setRange] = useState({ key: DEFAULT_TIME_RANGE, from: null, to: null })
  const { from, to } = useTimeWindow(range.key, range.from, range.to)
  const queryClient = useQueryClient()
  const fetching = useIsFetching()
  const summary = useSummary({ from, to })
  const lastRefresh = summary.dataUpdatedAt ? new Date(summary.dataUpdatedAt).toISOString() : null

  const onRefresh = () => queryClient.invalidateQueries()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Overview</h1>
          <p className="text-xs text-muted">
            Fleet health and detection activity at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">
            {lastRefresh ? `Updated ${formatTs(lastRefresh)}` : 'Loading…'}
          </span>
          <TimeRangePicker value={range} onChange={setRange} />
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetching ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </header>

      <OverviewKpis from={from} to={to} />

      <LiveMonitor />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AlertsOverTimeChart from={from} to={to} />
        </div>
        <SeverityDonut from={from} to={to} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {OVERVIEW_TOP_LISTS.map((list) => (
          <TopListCard key={list.key} title={list.title} by={list.by} filter={list.filter} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EngineAgreementChart />
        <LatestAlertTicker />
      </div>

        <CommunicationGraphWrapper />

        <PipelineHealthStrip />
    </div>
  )
}

export default OverviewPage
