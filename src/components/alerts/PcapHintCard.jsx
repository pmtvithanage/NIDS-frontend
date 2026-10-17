import { Loader2, Terminal } from 'lucide-react'

import CopyButton from '../common/CopyButton.jsx'
import { formatTs } from '../../utils/format.js'

/**
 * Packet capture hint: BPF filter, time window and copy-ready commands.
 * @param {{hint?: {bpf_filter: string, time_window: {from: string, to: string}}|null,
 *   loading?: boolean}} props
 */
function PcapHintCard({ hint, loading = false }) {
  return (
    <section className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-text">
        <Terminal className="h-4 w-4 text-muted" aria-hidden="true" />
        Capture filter
      </h2>

      {loading ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Building filter…
        </p>
      ) : hint ? (
        <div className="space-y-2">
          <code className="block break-all rounded-md border border-border bg-bg px-2 py-1.5 font-mono text-xs text-text">
            {hint.bpf_filter}
          </code>
          <p className="text-xs tabular-nums text-muted">
            {formatTs(hint.time_window.from)} – {formatTs(hint.time_window.to)}
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              value={`tcpdump -nn -r capture.pcap '${hint.bpf_filter}'`}
              label="Copy tcpdump"
              title="Copy tcpdump command"
              className="border border-border bg-surface-2"
            />
            <CopyButton
              value={hint.bpf_filter}
              label="Copy Wireshark filter"
              title="Copy Wireshark capture filter"
              className="border border-border bg-surface-2"
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted">No capture hint available.</p>
      )}
    </section>
  )
}

export default PcapHintCard
