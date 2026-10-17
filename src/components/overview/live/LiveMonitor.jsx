import { useMemo } from 'react'
import { Crosshair, Pause, Play } from 'lucide-react'

import AlertRateChart from './AlertRateChart.jsx'
import AnomalyChart from './AnomalyChart.jsx'
import LiveStatsStrip from './LiveStatsStrip.jsx'
import LiveUpdatedAt from './LiveUpdatedAt.jsx'
import ModelConfidenceChart from './ModelConfidenceChart.jsx'
import PipelineChart from './PipelineChart.jsx'
import TrafficChart from './TrafficChart.jsx'
import ChartCard from '../../common/ChartCard.jsx'
import ErrorState from '../../common/ErrorState.jsx'
import LoadingSkeleton from '../../common/LoadingSkeleton.jsx'
import {
  MONITOR_HISTORY_MINUTES,
  MONITOR_MAX_POINTS,
  MONITOR_WINDOWS,
} from '../../../constants/monitoring.js'
import { LiveChartSyncContext, useLiveChartSyncProvider } from '../../../hooks/useLiveChartSync.js'
import { useLiveMetrics } from '../../../hooks/useLiveMetrics.js'

const STATUS_META = {
  live: { label: 'Live', dot: 'bg-emerald-500' },
  reconnecting: { label: 'Reconnecting', dot: 'bg-amber-500' },
  paused: { label: 'Paused', dot: 'bg-slate-400' },
}

function LiveMonitor() {
  const metrics = useLiveMetrics({ minutes: MONITOR_HISTORY_MINUTES, maxPoints: MONITOR_MAX_POINTS })
  const {
    getPoints,
    subscribe,
    subscribeReset,
    subscribeLatest,
    getLatestSnapshot,
    paused,
    status,
    togglePause,
    reload,
    isLoading,
    error,
  } = metrics

  const feed = useMemo(
    () => ({ getPoints, subscribe, subscribeReset, isLoading, paused }),
    [getPoints, subscribe, subscribeReset, isLoading, paused],
  )
  const sync = useLiveChartSyncProvider(feed)
  const statusMeta = STATUS_META[status] ?? STATUS_META.live

  const chartProps = { feed, paused }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-text">Live monitor</h1>
          <p className="text-xs text-muted">
            <LiveUpdatedAt subscribeLatest={subscribeLatest} getLatestSnapshot={getLatestSnapshot} />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text">
            <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} aria-hidden="true" />
            {statusMeta.label}
          </span>

          <div className="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label="Visible time range">
            {MONITOR_WINDOWS.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={sync.windowMs === option.ms}
                onClick={() => sync.setWindowMs(option.ms)}
                className={`px-2.5 py-1 text-xs font-medium ${
                  sync.windowMs === option.ms ? 'bg-surface-2 text-text' : 'bg-surface text-muted hover:text-text'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={togglePause}
            aria-pressed={paused}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-2"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {paused ? 'Resume' : 'Pause'}
          </button>

          {sync.zoomed ? (
            <button
              type="button"
              onClick={sync.resetZoom}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-2"
            >
              <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
              Back to live
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <LiveChartSyncContext.Provider value={sync}>
          <LiveStatsStrip subscribeLatest={subscribeLatest} getLatestSnapshot={getLatestSnapshot} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Alert rate" description="Alerts detected per second, stacked by severity.">
              <AlertRateChart id="alerts" {...chartProps} />
            </ChartCard>
            <ChartCard title="Anomaly ratio" description="Autoencoder error over threshold (log scale).">
              <AnomalyChart id="anomaly" {...chartProps} />
            </ChartCard>
            <ChartCard title="Network traffic" description="Flows and bytes per second.">
              <TrafficChart id="traffic" {...chartProps} />
            </ChartCard>
            <ChartCard title="Ingest pipeline" description="Kafka consumer lag and ingest errors.">
              <PipelineChart id="pipeline" {...chartProps} />
            </ChartCard>
          </div>

          <ChartCard title="Model confidence" description="Average MLP confidence per second.">
            <ModelConfidenceChart id="confidence" {...chartProps} />
          </ChartCard>
        </LiveChartSyncContext.Provider>
      )}
    </div>
  )
}

export default LiveMonitor
