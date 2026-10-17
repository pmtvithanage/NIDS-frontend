import { memo } from 'react'

import { formatRatio } from '../../utils/format.js'

const MIN_RATIO = 0.01
const MAX_RATIO = 1000
const MIN_LOG = Math.log10(MIN_RATIO)
const MAX_LOG = Math.log10(MAX_RATIO)

function ratioToPosition(ratio) {
  const clamped = Math.min(Math.max(ratio, MIN_RATIO), MAX_RATIO)
  return (Math.log10(clamped) - MIN_LOG) / (MAX_LOG - MIN_LOG)
}

/**
 * Log-scale gauge for the autoencoder error ratio with a threshold tick.
 * @param {{ratio?: number, thresholdRatio?: number, className?: string}} props
 */
function AEGauge({ ratio = 0, thresholdRatio = 1, className = '' }) {
  const position = ratioToPosition(ratio)
  const thresholdPosition = ratioToPosition(thresholdRatio)
  const over = ratio >= thresholdRatio
  return (
    <div className={className}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full ${over ? 'bg-sev-critical' : 'bg-sev-low'}`}
          style={{ width: `${position * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-text"
          style={{ left: `${thresholdPosition * 100}%` }}
          title="threshold"
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
        <span>0.01x</span>
        <span className="tabular-nums text-text">
          {formatRatio(ratio)} {over ? 'above' : 'below'} threshold
        </span>
        <span>1000x</span>
      </div>
    </div>
  )
}

export default memo(AEGauge)
