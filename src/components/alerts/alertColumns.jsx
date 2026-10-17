import AEGauge from '../../components/common/AEGauge.jsx'
import ConfidenceBar from '../../components/common/ConfidenceBar.jsx'
import EvidenceBadge from '../../components/common/EvidenceBadge.jsx'
import FlowTuple from '../../components/common/FlowTuple.jsx'
import SeverityBadge from '../../components/common/SeverityBadge.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { formatTs } from '../../utils/format.js'

const DASH = '\u2014'

/**
 * Column definitions for the alerts table. Kept at module scope so the table
 * row model stays stable across renders. `meta.col` is the CSS grid track used
 * by the header and rows; `meta.sortField` maps a column to a server sort key.
 */
export const alertColumns = [
  {
    id: 'ts',
    accessorKey: 'ts',
    header: 'Time',
    meta: { sortable: true, sortField: 'ts', col: '140px' },
    cell: (info) => (
      <span className="text-xs tabular-nums text-muted">
        {formatTs(info.row.original.ts, { withSeconds: false })}
      </span>
    ),
  },
  {
    id: 'severity',
    accessorKey: 'severity_tier',
    header: 'Severity',
    meta: { sortable: true, sortField: 'severity_tier', col: '120px' },
    cell: (info) => <SeverityBadge tier={info.row.original.severity_tier} />,
  },
  {
    id: 'flow',
    header: 'Flow',
    meta: { col: 'minmax(240px, 1.3fr)' },
    cell: (info) => {
      const alert = info.row.original
      return (
        <FlowTuple
          src_ip={alert.src_ip}
          dst_ip={alert.dst_ip}
          dst_port={alert.dst_port}
          direction={alert.direction}
          protocol={alert.protocol}
        />
      )
    },
  },
  {
    id: 'detection',
    accessorKey: 'mlp_confidence',
    header: 'Detection',
    meta: { sortable: true, sortField: 'mlp_confidence', col: '190px' },
    cell: (info) => {
      const alert = info.row.original
      return (
        <div className="flex flex-col gap-1">
          <span className="truncate text-xs font-medium text-text">{alert.mlp_label}</span>
          <ConfidenceBar value={alert.mlp_confidence} />
        </div>
      )
    },
  },
  {
    id: 'ae',
    accessorKey: 'ae_ratio',
    header: 'AE error',
    meta: { sortable: true, sortField: 'ae_ratio', col: '150px' },
    cell: (info) => (
      <AEGauge ratio={info.row.original.ae_ratio} thresholdRatio={1} className="w-full" />
    ),
  },
  {
    id: 'signature',
    header: 'Suricata signature',
    meta: { col: 'minmax(190px, 1.5fr)' },
    cell: (info) => {
      const signature = info.row.original.suricata?.signature ?? DASH
      return (
        <span className="block truncate text-xs text-muted" title={signature}>
          {signature}
        </span>
      )
    },
  },
  {
    id: 'evidence',
    accessorKey: 'evidence_score',
    header: 'Evidence',
    meta: { sortable: true, sortField: 'evidence_score', col: '165px' },
    cell: (info) => {
      const alert = info.row.original
      return (
        <EvidenceBadge
          quality={alert.evidence_quality}
          score={alert.evidence_score}
          likelyBenign={alert.likely_benign}
        />
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true, sortField: 'status', col: '135px' },
    cell: (info) => (
      <span className="inline-flex items-center gap-1.5">
        <StatusBadge status={info.row.original.status} />
        {info.row.original.suppressed ? (
          <span className="rounded border border-border px-1 py-0.5 text-[10px] uppercase text-muted">
            suppressed
          </span>
        ) : null}
      </span>
    ),
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: 'Assignee',
    meta: { sortable: true, sortField: 'assignee', col: '130px' },
    cell: (info) => (
      <span className="truncate text-xs text-muted">{info.row.original.assignee ?? DASH}</span>
    ),
  },
]

/** CSS grid template shared by the header row and every body row. */
export const ALERT_GRID_TEMPLATE = `40px ${alertColumns
  .map((column) => column.meta?.col ?? 'minmax(120px, 1fr)')
  .join(' ')} 96px`
