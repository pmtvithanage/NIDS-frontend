import { Link } from 'react-router-dom'
import { Loader2, SkipForward } from 'lucide-react'

import AEGauge from '../common/AEGauge.jsx'
import ConfidenceBar from '../common/ConfidenceBar.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { LABEL_KEY_MAP, SKIP_KEY } from '../../constants/labeling.js'
import { formatTs } from '../../utils/format.js'

const CHOICES = Object.entries(LABEL_KEY_MAP).map(([key, value]) => ({ key, value }))

/**
 * Active labeling card: evidence summary plus one-key label buttons.
 * @param {{item: object, onLabel: (label: string) => void, onSkip: () => void, busy?: boolean}} props
 */
function LabelQueueCard({ item, onLabel, onSkip, busy = false }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <SeverityBadge tier={item.severity_tier} />
        <Link to={`/alerts/${item.id}`} className="font-mono text-xs text-accent hover:underline">
          {item.id}
        </Link>
        <span className="text-xs tabular-nums text-muted">{formatTs(item.ts)}</span>
      </div>

      <p className="mt-2 break-all font-mono text-xs text-text" title={item.flow_key}>
        {item.flow_key ?? 'no IP tuple (decode error)'}
      </p>
      <p className="mt-1 truncate text-xs text-muted" title={item.signature}>
        {item.signature}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted">MLP classifier</p>
          <p className="text-sm font-semibold text-text">{item.mlp_label}</p>
          <div className="mt-1">
            <ConfidenceBar value={item.mlp_confidence} label="MLP confidence" />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted">Autoencoder ratio</p>
          <p className="text-sm font-semibold tabular-nums text-text">{item.ae_ratio}x</p>
          <div className="mt-2">
            <AEGauge ratio={item.ae_ratio} thresholdRatio={1} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        Suggested: <span className="font-medium text-text">{item.suggested ?? '—'}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHOICES.map((choice) => (
          <button
            key={choice.value}
            type="button"
            disabled={busy}
            onClick={() => onLabel(choice.value)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text hover:border-accent hover:bg-surface-2 disabled:opacity-60"
          >
            <kbd className="rounded border border-border px-1 text-[10px] uppercase text-muted">
              {choice.key}
            </kbd>
            {choice.value}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={onSkip}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted hover:bg-surface-2 hover:text-text disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Skip
          <kbd className="rounded border border-border px-1 text-[10px] uppercase">{SKIP_KEY}</kbd>
        </button>
      </div>
    </section>
  )
}

export default LabelQueueCard
