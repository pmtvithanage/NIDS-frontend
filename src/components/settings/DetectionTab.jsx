import { RotateCcw } from 'lucide-react'

import Toggle from '../common/Toggle.jsx'
import { DETECTION_DEFAULTS, THRESHOLD_RANGE } from '../../constants/settings.js'
import { useDetectionSettings } from '../../hooks/usePreferences.js'

const { min: MIN, max: MAX, step: STEP } = THRESHOLD_RANGE

function ThresholdSlider({ label, hint, value, onChange }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <label htmlFor={label} className="text-sm text-text">
          {label}
        </label>
        <span className="tabular-nums text-sm font-medium text-text">{value.toFixed(2)}</span>
      </div>
      <input
        id={label}
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--accent)]"
      />
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </div>
  )
}

/** Detection display thresholds that drive the "likely noise" rule. */
function DetectionTab() {
  const { settings, update, reset } = useDetectionSettings()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-prose text-xs text-muted">
          An alert is flagged as <span className="text-text">likely noise</span> when the Suricata signature
          weight is below the signature cutoff <span className="text-text">and</span> the MLP confidence is
          below the confidence cutoff.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset defaults
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ThresholdSlider
          label="MLP confidence cutoff"
          hint="Detections with lower classifier confidence are treated as uncertain."
          value={settings.mlpNoiseCutoff}
          onChange={(value) => update({ mlpNoiseCutoff: value })}
        />
        <ThresholdSlider
          label="Signature weight cutoff"
          hint="Signatures lighter than this are treated as weak indicators."
          value={settings.signatureWeightCutoff}
          onChange={(value) => update({ signatureWeightCutoff: value })}
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <Toggle
          label="Use defaults"
          checked={
            settings.mlpNoiseCutoff === DETECTION_DEFAULTS.mlpNoiseCutoff &&
            settings.signatureWeightCutoff === DETECTION_DEFAULTS.signatureWeightCutoff
          }
          onChange={(checked) => (checked ? reset() : undefined)}
        />
        <span className="text-xs text-muted">Restores both cutoffs to their recommended values.</span>
      </div>
    </div>
  )
}

export default DetectionTab
