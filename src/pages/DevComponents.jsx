import { useState } from 'react'

import AEGauge from '../components/common/AEGauge.jsx'
import ConfidenceBar from '../components/common/ConfidenceBar.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import EngineChips from '../components/common/EngineChips.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EvidenceBadge from '../components/common/EvidenceBadge.jsx'
import FilterBar from '../components/common/FilterBar.jsx'
import FlowTuple from '../components/common/FlowTuple.jsx'
import JsonViewer from '../components/common/JsonViewer.jsx'
import KpiTile from '../components/common/KpiTile.jsx'
import LoadMore from '../components/common/LoadMore.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import SeverityBadge from '../components/common/SeverityBadge.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import TimeRangePicker from '../components/common/TimeRangePicker.jsx'
import DygraphDemo from '../components/dev/DygraphDemo.jsx'
import GalleryRow from '../components/dev/GalleryRow.jsx'
import { SEVERITY } from '../constants/severity.js'

const SAMPLE = {
  id: 'ALT-000001',
  flow_key: '192.168.8.100-20.205.243.168-443',
  severity_tier: 'CRITICAL',
  status: 'new',
  mlp_label: 'DDoS',
  mlp_confidence: 0.5886,
  ae_error: 78.22,
  ae_threshold: 0.105,
  reasons: [
    'suricata:SURICATA IPv4 invalid checksum',
    'mlp:DDoS(0.5886)',
    'ae:744.86x_threshold',
  ],
}

/** Temporary gallery for shared components. */
function DevComponents() {
  const [range, setRange] = useState({ key: '24h' })
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold text-text">Component gallery</h1>
      <p className="mt-1 text-sm text-muted">Temporary dev page for shared components.</p>

      <div className="mt-4">
        <GalleryRow label="SeverityBadge">
          {Object.values(SEVERITY).map((tier) => (
            <SeverityBadge key={tier} tier={tier} />
          ))}
        </GalleryRow>
        <GalleryRow label="StatusBadge">
          <StatusBadge status="new" />
          <StatusBadge status="investigating" />
          <StatusBadge status="resolved" kind="incident" />
          <StatusBadge status="triaging" kind="incident" />
        </GalleryRow>
        <GalleryRow label="EngineChips">
          <EngineChips reasons={SAMPLE.reasons} />
        </GalleryRow>
        <GalleryRow label="ConfidenceBar">
          <ConfidenceBar value={0.5886} />
          <ConfidenceBar value={0.92} />
        </GalleryRow>
        <GalleryRow label="AEGauge">
          <div className="w-72">
            <AEGauge ratio={744.86} thresholdRatio={1} />
          </div>
        </GalleryRow>
        <GalleryRow label="FlowTuple">
          <FlowTuple src_ip="192.168.8.100" dst_ip="20.205.243.168" dst_port={443} direction="outbound" />
          <FlowTuple direction="inbound" protocol="ICMP" />
        </GalleryRow>
        <GalleryRow label="EvidenceBadge">
          <EvidenceBadge quality="high" score={92} />
          <EvidenceBadge quality="low" score={18} likelyBenign />
        </GalleryRow>
        <GalleryRow label="KpiTile">
          <KpiTile label="Alerts (24h)" value="1,284" hint="vs. previous 24h" trend={12} />
          <KpiTile label="Critical" value={37} trend={-4} />
        </GalleryRow>
        <GalleryRow label="TimeRangePicker">
          <TimeRangePicker value={range} onChange={setRange} />
        </GalleryRow>
        <GalleryRow label="FilterBar">
          <div className="w-full">
            <FilterBar onClear={() => {}}>
              <SeverityBadge tier="HIGH" />
              <StatusBadge status="new" />
            </FilterBar>
          </div>
        </GalleryRow>
        <GalleryRow label="LoadMore">
          <LoadMore meta={{ total: 120, has_more: true }} count={25} onLoadMore={() => {}} />
          <LoadMore meta={{ total: 25, has_more: false }} count={25} onLoadMore={() => {}} />
        </GalleryRow>
        <GalleryRow label="LoadingSkeleton">
          <div className="w-full">
            <LoadingSkeleton rows={2} />
          </div>
        </GalleryRow>
        <GalleryRow label="EmptyState">
          <EmptyState title="No alerts match" description="Try widening the time range." />
        </GalleryRow>
        <GalleryRow label="ErrorState">
          <ErrorState error={new Error('Network request failed')} onRetry={() => {}} />
        </GalleryRow>
        <GalleryRow label="JsonViewer">
          <div className="w-full">
            <JsonViewer data={SAMPLE} title="alert" defaultOpen />
          </div>
        </GalleryRow>
        <GalleryRow label="ConfirmDialog">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-surface-2"
          >
            Open dialog
          </button>
        </GalleryRow>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <h2 className="text-sm font-semibold text-text">DygraphChart</h2>
        <p className="mt-1 text-xs text-muted">
          Streaming demo — ring buffer outside React state, redrawn at most once per second.
        </p>
        <div className="mt-3">
          <DygraphDemo />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete suppression?"
        description="This rule will stop suppressing matching alerts."
        confirmLabel="Delete"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default DevComponents
