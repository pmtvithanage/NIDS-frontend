/**
 * Temporary streaming demo for the DygraphChart wrapper.
 * @module components/dev/DygraphDemo
 */

import { useEffect, useRef, useState } from 'react'

import DygraphChart from '../charts/DygraphChart.jsx'

const DEMO_TICK_MS = 1000
const DEMO_WINDOW_POINTS = 60
const DEMO_BUTTON =
  'rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-50'

function buildSeedRows(count) {
  const rows = []
  let alerts = 40
  let aeError = 1.2
  const now = Date.now()
  for (let i = count - 1; i >= 0; i -= 1) {
    alerts = Math.max(5, alerts + (Math.random() - 0.5) * 12)
    aeError = Math.max(0.2, aeError + (Math.random() - 0.5) * 0.4)
    rows.push([new Date(now - i * DEMO_TICK_MS), Math.round(alerts), Number(aeError.toFixed(2))])
  }
  return rows
}

/** Streaming DygraphChart used in the component gallery. */
function DygraphDemo() {
  const chartRef = useRef(null)
  const cursorRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    const rows = buildSeedRows(DEMO_WINDOW_POINTS)
    const last = rows[rows.length - 1]
    cursorRef.current = { alerts: last[1], aeError: last[2] }
    chartRef.current?.append(rows)

    const timer = window.setInterval(() => {
      const cursor = cursorRef.current
      cursor.alerts = Math.max(5, cursor.alerts + (Math.random() - 0.5) * 12)
      cursor.aeError = Math.max(0.2, cursor.aeError + (Math.random() - 0.5) * 0.4)
      chartRef.current?.append([
        [new Date(), Math.round(cursor.alerts), Number(cursor.aeError.toFixed(2))],
      ])
    }, DEMO_TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  const togglePause = () => {
    if (paused) chartRef.current?.resume()
    else chartRef.current?.pause()
    setPaused(!paused)
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className={DEMO_BUTTON} onClick={togglePause}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className={DEMO_BUTTON}
          disabled={!zoomed}
          onClick={() => chartRef.current?.resetZoom()}
        >
          Back to live
        </button>
      </div>

      <DygraphChart
        ref={chartRef}
        labels={['Time', 'Alerts/s', 'AE error']}
        colors={['--sev-critical', '--accent']}
        maxPoints={DEMO_WINDOW_POINTS}
        height={180}
        ariaLabel="Streaming demo of alerts per second and autoencoder error"
        onZoomChange={setZoomed}
        thresholdLines={[{ value: 1, color: '--sev-high', label: 'AE threshold' }]}
      />
    </div>
  )
}

export default DygraphDemo
