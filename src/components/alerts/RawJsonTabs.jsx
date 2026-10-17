import { useState } from 'react'

import JsonViewer from '../common/JsonViewer.jsx'

const TABS = [
  { key: 'fusion', label: 'fusion' },
  { key: 'suricata', label: 'suricata' },
  { key: 'flow', label: 'flow' },
  { key: 'features', label: 'features' },
]

function buildTabData(detail) {
  return {
    fusion: {
      id: detail.id,
      ts: detail.ts,
      severity_tier: detail.severity_tier,
      status: detail.status,
      assignee: detail.assignee,
      human_label: detail.human_label ?? null,
      evidence_score: detail.evidence_score,
      evidence_quality: detail.evidence_quality,
      likely_benign: detail.likely_benign,
      mlp_label: detail.mlp_label,
      mlp_confidence: detail.mlp_confidence,
      ae_ratio: detail.ae_ratio,
      reasons: detail.reasons,
    },
    suricata: detail.engines?.suricata ?? detail.suricata,
    flow: detail.flow,
    features: detail.feature_vector,
  }
}

/**
 * Raw JSON tabs for the fusion record, Suricata event, flow row and features.
 * @param {{detail: object}} props
 */
function RawJsonTabs({ detail }) {
  const [active, setActive] = useState('fusion')
  const data = buildTabData(detail)

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-text">Raw JSON</h2>
      <div role="tablist" className="inline-flex overflow-hidden rounded-md border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-3 py-1.5 font-mono text-xs ${
              active === tab.key
                ? 'bg-accent text-accent-fg'
                : 'bg-surface text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <JsonViewer key={active} data={data[active]} title={`${active}.json`} defaultOpen />
    </section>
  )
}

export default RawJsonTabs
