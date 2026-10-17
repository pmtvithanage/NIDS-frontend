import { Activity, Brain, Shield } from 'lucide-react'

import AEGauge from '../common/AEGauge.jsx'
import ConfidenceBar from '../common/ConfidenceBar.jsx'
import { formatRatio } from '../../utils/format.js'

const DASH = '\u2014'

function Field({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className="text-right text-text">{children}</span>
    </div>
  )
}

function EngineCard({ title, Icon, accent, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text">{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

/**
 * Per-engine (Suricata / MLP / autoencoder) signal panel.
 * @param {{engines: object}} props
 */
function EnginePanel({ engines }) {
  const { suricata, mlp, autoencoder } = engines

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-text">Detection engines</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <EngineCard title="Suricata" Icon={Shield} accent="text-sev-high">
          <p className="text-xs text-text">{suricata.signature}</p>
          <Field label="Signature id">
            <span className="font-mono">{suricata.signature_id}</span>
          </Field>
          <Field label="Category">{suricata.category ?? DASH}</Field>
          <Field label="Priority">{suricata.severity ?? DASH}</Field>
          <Field label="Weight">{Number(suricata.weight ?? 0).toFixed(2)}</Field>
          <Field label="Matched">{suricata.matched ? 'yes' : 'no IP tuple'}</Field>
        </EngineCard>

        <EngineCard title="MLP classifier" Icon={Brain} accent="text-accent">
          <Field label="Label">{mlp.label}</Field>
          <div className="pt-0.5">
            <ConfidenceBar value={mlp.confidence} label="MLP confidence" />
          </div>
          <div className="mt-1 space-y-1">
            {(mlp.top_classes ?? []).map((entry) => (
              <Field key={entry.label} label={entry.label}>
                <span className="tabular-nums">{entry.prob}</span>
              </Field>
            ))}
          </div>
        </EngineCard>

        <EngineCard title="Autoencoder" Icon={Activity} accent="text-sev-medium">
          <Field label="AE error">
            <span className="tabular-nums">{Number(autoencoder.error ?? 0).toFixed(3)}</span>
          </Field>
          <Field label="Threshold">
            <span className="tabular-nums">{Number(autoencoder.threshold ?? 0).toFixed(3)}</span>
          </Field>
          <Field label="Ratio">
            <span className="tabular-nums">{formatRatio(autoencoder.ratio)}</span>
          </Field>
          <div className="pt-1">
            <AEGauge ratio={autoencoder.ratio} thresholdRatio={1} />
          </div>
        </EngineCard>
      </div>
    </section>
  )
}

export default EnginePanel
