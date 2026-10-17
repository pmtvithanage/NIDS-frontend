import { useSyncExternalStore } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

import { formatRatio } from '../../../utils/format.js'

const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus }
const TREND_LABEL = { up: 'higher than 1 minute ago', down: 'lower than 1 minute ago', flat: 'unchanged' }

function trendOf(current, previous) {
  if (current == null || previous == null || current === previous) return 'flat'
  return current > previous ? 'up' : 'down'
}

/**
 * Compact live KPI row: current values with a one-minute trend arrow.
 *
 * Subscribes to the metrics external store, so the strip updates at most once
 * per second without re-rendering its parent (AGENTS.md §9).
 * @param {{
 *   subscribeLatest: (listener: () => void) => () => void,
 *   getLatestSnapshot: () => {latest: object|null, previous: object|null, pausedCount: number},
 * }} props
 */
function LiveStatsStrip({ subscribeLatest, getLatestSnapshot }) {
  const { latest, previous } = useSyncExternalStore(
    subscribeLatest,
    getLatestSnapshot,
    getLatestSnapshot,
  )

  if (!latest) return null

  const alertsTotal =
    latest.alerts.critical + latest.alerts.high + latest.alerts.medium + latest.alerts.low
  const previousAlerts = previous
    ? previous.alerts.critical + previous.alerts.high + previous.alerts.medium + previous.alerts.low
    : null

  const items = [
    { key: 'alerts', label: 'Alerts/s', value: alertsTotal, prev: previousAlerts, text: alertsTotal.toFixed(0) },
    { key: 'flows', label: 'Flows/s', value: latest.flows_per_sec, prev: previous?.flows_per_sec, text: latest.flows_per_sec.toFixed(1) },
    { key: 'p95', label: 'Anomaly p95', value: latest.ae_ratio_p95, prev: previous?.ae_ratio_p95, text: formatRatio(latest.ae_ratio_p95) },
    { key: 'lag', label: 'Kafka lag', value: latest.kafka_lag, prev: previous?.kafka_lag, text: latest.kafka_lag.toFixed(0) },
    { key: 'conf', label: 'MLP conf.', value: latest.mlp_conf_avg, prev: previous?.mlp_conf_avg, text: latest.mlp_conf_avg.toFixed(2) },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const trend = trendOf(item.value, item.prev)
        const Icon = TREND_ICON[trend]
        return (
          <div key={item.key} className="rounded-lg border border-border bg-surface px-3 py-2">
            <dt className="text-xs text-muted">{item.label}</dt>
            <dd className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tabular-nums text-text">{item.text}</span>
              <span
                className="inline-flex items-center gap-0.5 text-muted"
                title={TREND_LABEL[trend]}
                aria-label={TREND_LABEL[trend]}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

export default LiveStatsStrip
