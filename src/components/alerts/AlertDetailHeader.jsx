import { Radio } from 'lucide-react'

import CopyButton from '../common/CopyButton.jsx'
import EngineChips from '../common/EngineChips.jsx'
import EvidenceBadge from '../common/EvidenceBadge.jsx'
import FlowTuple from '../common/FlowTuple.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { ASSIGNEES } from '../../constants/assignees.js'
import { ALERT_STATUSES, ALERT_STATUS_LABEL } from '../../constants/statuses.js'
import { formatTs } from '../../utils/format.js'

const SELECT_CLASS =
  'rounded-md border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60'

/**
 * Alert detail header: severity/evidence, flow, timestamp, sensor and the
 * status/assignee controls.
 * @param {{detail: object, busy?: boolean, onSetStatus: (status: string) => void,
 *   onAssign: (assignee: string|null) => void}} props
 */
function AlertDetailHeader({ detail, busy = false, onSetStatus, onAssign }) {
  const utc = formatTs(detail.ts, { timeZone: 'UTC' })
  const assigneeValue = detail.assignee ?? ''

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge tier={detail.severity_tier} />
            <EvidenceBadge
              quality={detail.evidence_quality}
              score={detail.evidence_score}
              likelyBenign={detail.likely_benign}
            />
            {detail.human_label ? (
              <span className="rounded border border-accent/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                label: {detail.human_label}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="font-mono text-sm text-text">{detail.id}</span>
              <CopyButton value={detail.id} title={`Copy id ${detail.id}`} />
            </span>
            <FlowTuple
              src_ip={detail.src_ip}
              dst_ip={detail.dst_ip}
              dst_port={detail.dst_port}
              direction={detail.direction}
              protocol={detail.protocol}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span title={`UTC ${utc}`} className="tabular-nums">
              {formatTs(detail.ts)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3.5 w-3.5" aria-hidden="true" />
              sensor {detail.sensor}
            </span>
          </div>

          <EngineChips reasons={detail.reasons} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs text-muted">
            Status
            <select
              value={detail.status}
              disabled={busy}
              onChange={(event) => onSetStatus(event.target.value)}
              className={SELECT_CLASS}
            >
              {ALERT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ALERT_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs text-muted">
            Assignee
            <select
              value={assigneeValue}
              disabled={busy}
              onChange={(event) => onAssign(event.target.value || null)}
              className={SELECT_CLASS}
            >
              <option value="">Unassigned</option>
              {ASSIGNEES.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  )
}

export default AlertDetailHeader
