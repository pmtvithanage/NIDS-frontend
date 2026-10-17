import { Globe, Server, ShieldOff } from 'lucide-react'

import { SEVERITY_LABEL, SEVERITY_ORDER } from '../../constants/severity.js'
import { formatTs } from '../../utils/format.js'

const DOT = {
  LOW: 'bg-sev-low',
  MEDIUM: 'bg-sev-medium',
  HIGH: 'bg-sev-high',
  CRITICAL: 'bg-sev-critical',
}

function Fact({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className={`text-right text-text ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

/**
 * Host summary card: identity, network metadata, activity window and the
 * "create suppression" action.
 * @param {{host: object, onSuppress: () => void, suppressBusy?: boolean}} props
 */
function HostFactsCard({ host, onSuppress, suppressBusy = false }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold text-text">{host.ip}</h1>
            <span
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                host.is_internal ? 'border-border text-muted' : 'border-sev-medium/40 text-sev-medium'
              }`}
            >
              {host.is_internal ? (
                <Server className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Globe className="h-3 w-3" aria-hidden="true" />
              )}
              {host.is_internal ? 'internal' : 'external'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {host.org} &middot; {host.asn} &middot; {host.country}
          </p>
        </div>
        <button
          type="button"
          onClick={onSuppress}
          disabled={suppressBusy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
        >
          <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
          Create suppression for this host
        </button>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <Fact label="Role" value={host.role} />
        <Fact label="rDNS" value={host.rdns ?? 'n/a'} mono />
        <Fact label="First seen" value={formatTs(host.first_seen)} />
        <Fact label="Last seen" value={formatTs(host.last_seen)} />
        <Fact label="Alerts (total)" value={host.alert_count} />
        <Fact label="As source / target" value={`${host.as_source} / ${host.as_target}`} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
        {SEVERITY_ORDER.map((tier) => (
          <span key={tier} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className={`h-2 w-2 rounded-full ${DOT[tier]}`} aria-hidden="true" />
            {SEVERITY_LABEL[tier]}
            <span className="tabular-nums text-text">{host.severity_breakdown?.[tier] ?? 0}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export default HostFactsCard
