import { memo } from 'react'
import { Activity, Brain, Shield } from 'lucide-react'

import { parseReasons } from '../../utils/parseReason.js'

const STYLES = {
  suricata: 'border-border text-muted',
  mlp: 'border-accent/40 text-accent',
  ae: 'border-sev-medium/40 text-sev-medium',
}

function chipContent(reason) {
  if (reason.type === 'suricata') {
    return { Icon: Shield, label: reason.signature }
  }
  if (reason.type === 'mlp') {
    const pct = reason.confidence == null ? '' : ` ${(reason.confidence * 100).toFixed(0)}%`
    return { Icon: Brain, label: `${reason.label}${pct}` }
  }
  if (reason.type === 'ae') {
    return { Icon: Activity, label: reason.ratio == null ? 'AE' : `${reason.ratio}x AE` }
  }
  return { Icon: Shield, label: reason.raw ?? 'unknown' }
}

/**
 * Renders each fusion reason as an engine chip.
 * @param {{reasons?: string[], className?: string}} props
 */
function EngineChips({ reasons = [], className = '' }) {
  const parsed = parseReasons(reasons)
  if (parsed.length === 0) return <span className="text-xs text-muted">no reasons</span>
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {parsed.map((reason, index) => {
        const { Icon, label } = chipContent(reason)
        return (
          <span
            key={`${reason.type}-${index}`}
            title={label}
            className={`inline-flex max-w-[16rem] items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] ${STYLES[reason.type] ?? 'border-border text-muted'}`}
          >
            <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </span>
        )
      })}
    </div>
  )
}

export default memo(EngineChips)
