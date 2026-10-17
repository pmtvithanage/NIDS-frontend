import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import ChartCard from '../common/ChartCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import EvidenceBadge from '../common/EvidenceBadge.jsx'
import FlowTuple from '../common/FlowTuple.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { useAlertStream } from '../../hooks/useAlertStream.js'
import { useAlerts } from '../../hooks/useAlerts.js'
import {
  OVERVIEW_RELATIVE_REFRESH_MS,
  OVERVIEW_TICKER_BATCH_MS,
  OVERVIEW_TICKER_SIZE,
} from '../../constants/overview.js'
import { SEVERITY } from '../../constants/severity.js'
import { formatRelative } from '../../utils/format.js'

/**
 * Live ticker of the most recent high-severity alerts. New alerts slide in at
 * the top; the list pauses while hovered/focused so the row under the pointer
 * never shifts. Each row links to its alert detail.
 */
function LatestAlertTicker() {
  const seed = useAlerts({
    severity: [SEVERITY.HIGH, SEVERITY.CRITICAL],
    limit: OVERVIEW_TICKER_SIZE,
  })
  const [incoming, setIncoming] = useState([])
  const [now, setNow] = useState(() => Date.now())
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const pendingRef = useRef([])
  const timerRef = useRef(0)

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = 0
    if (pendingRef.current.length === 0) return
    const queued = pendingRef.current.slice().reverse()
    pendingRef.current = []
    setIncoming((prev) => [...queued, ...prev].slice(0, OVERVIEW_TICKER_SIZE))
  }, [])

  useAlertStream(
    (alert) => {
      pendingRef.current.push(alert)
      if (pausedRef.current || timerRef.current) return
      timerRef.current = window.setTimeout(flush, OVERVIEW_TICKER_BATCH_MS)
    },
    { minSeverity: SEVERITY.HIGH },
  )

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), OVERVIEW_RELATIVE_REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const pause = () => {
    pausedRef.current = true
    setPaused(true)
  }
  const resume = () => {
    pausedRef.current = false
    setPaused(false)
    flush()
  }

  const items = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const alert of [...incoming, ...(seed.data?.data ?? [])]) {
      if (seen.has(alert.id)) continue
      seen.add(alert.id)
      out.push(alert)
      if (out.length >= OVERVIEW_TICKER_SIZE) break
    }
    return out
  }, [incoming, seed.data])

  return (
    <ChartCard
      title="Latest high-severity alerts"
      description="Newest HIGH and CRITICAL detections, live."
      action={
        paused ? (
          <span className="text-xs font-medium text-muted" role="status">
            Paused
          </span>
        ) : null
      }
    >
      {seed.isLoading && items.length === 0 ? <LoadingSkeleton rows={OVERVIEW_TICKER_SIZE} /> : null}
      {seed.isError && items.length === 0 ? (
        <ErrorState error={seed.error} onRetry={seed.refetch} />
      ) : null}
      {!seed.isLoading && items.length === 0 ? (
        <EmptyState title="Waiting for alerts" description="High-severity detections appear here live." />
      ) : null}
      {items.length > 0 ? (
        <ul
          className="space-y-1.5"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
        >
          {items.map((alert) => (
            <li key={alert.id} className="ticker-in">
              <Link
                to={`/alerts/${alert.id}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-surface px-2.5 py-2 hover:bg-surface-2"
              >
                <SeverityBadge tier={alert.severity_tier} />
                <FlowTuple
                  src_ip={alert.src_ip}
                  dst_ip={alert.dst_ip}
                  dst_port={alert.dst_port}
                  direction={alert.direction}
                  protocol={alert.protocol}
                  copyable={false}
                />
                <EvidenceBadge quality={alert.evidence_quality} likelyBenign={alert.likely_benign} />
                <span className="ml-auto text-xs tabular-nums text-muted">
                  {formatRelative(alert.ts, now)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </ChartCard>
  )
}

export default LatestAlertTicker
