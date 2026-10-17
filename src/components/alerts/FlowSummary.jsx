import { Link } from 'react-router-dom'
import { AlertTriangle, ExternalLink } from 'lucide-react'

import { formatBytes, formatDuration } from '../../utils/format.js'
import { formatFeatureValue, hasPortMismatch, parseFlowKeyPort } from '../../utils/flow.js'

function Stat({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className={`tabular-nums text-text ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function Group({ title, children }) {
  return (
    <div className="rounded-md border border-border bg-surface-2/40 p-2.5">
      <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

const duration = (value) => (value == null ? 'n/a' : formatDuration(value))
const bytes = (value) => (value == null ? 'n/a' : formatBytes(value))

/**
 * Flow summary: duration, volumes, IAT, TCP flags and window sizes, with a
 * data-integrity warning when the flow key port disagrees with the features.
 * @param {{flow: object, featureVector: object}} props
 */
function FlowSummary({ flow, featureVector = {} }) {
  const vector = featureVector
  const featureDstPort = vector['Destination Port']
  const mismatch = hasPortMismatch(flow.flow_key, featureDstPort)

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text">Flow summary</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {flow.src_ip ? (
            <Link
              to={`/hosts/${flow.src_ip}`}
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              Source host {flow.src_ip}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          ) : null}
          {flow.dst_ip ? (
            <Link
              to={`/hosts/${flow.dst_ip}`}
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              Destination host {flow.dst_ip}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>

      {mismatch ? (
        <p className="inline-flex items-center gap-1.5 rounded border border-sev-medium/40 bg-sev-medium/10 px-2 py-1 text-xs text-sev-medium">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Integrity: flow key port ({parseFlowKeyPort(flow.flow_key)}) differs from the feature
          vector destination port ({featureDstPort}).
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Group title="Duration & volume">
          <Stat label="Duration" value={duration(flow.duration_us)} />
          <Stat label="Fwd packets" value={vector['Total Fwd Packets'] ?? 0} />
          <Stat label="Bwd packets" value={vector['Total Backward Packets'] ?? 0} />
          <Stat label="Fwd bytes" value={bytes(vector['Total Length of Fwd Packets'])} />
          <Stat label="Bwd bytes" value={bytes(vector['Total Length of Bwd Packets'])} />
        </Group>

        <Group title="Inter-arrival time">
          <Stat label="IAT mean" value={duration(vector['Flow IAT Mean'])} />
          <Stat label="IAT std" value={duration(vector['Flow IAT Std'])} />
          <Stat label="IAT max" value={duration(vector['Flow IAT Max'])} />
          <Stat label="IAT min" value={duration(vector['Flow IAT Min'])} />
        </Group>

        <Group title="TCP flags">
          <Stat label="FIN" value={vector['FIN Flag Count'] ?? 0} />
          <Stat label="SYN" value={vector['SYN Flag Count'] ?? 0} />
          <Stat label="RST" value={vector['RST Flag Count'] ?? 0} />
          <Stat label="PSH" value={vector['PSH Flag Count'] ?? 0} />
          <Stat label="ACK" value={vector['ACK Flag Count'] ?? 0} />
        </Group>

        <Group title="Window sizes">
          <Stat label="Init win (fwd)" value={formatFeatureValue(vector['Init_Win_bytes_forward'])} />
          <Stat
            label="Init win (bwd)"
            value={formatFeatureValue(vector['Init_Win_bytes_backward'])}
          />
          <Stat label="Protocol" value={flow.protocol ?? 'n/a'} />
          <Stat label="Direction" value={flow.direction ?? 'n/a'} />
        </Group>
      </div>
    </section>
  )
}

export default FlowSummary
