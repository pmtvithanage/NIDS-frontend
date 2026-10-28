import { useEffect, useState } from 'react'
import { Loader2, ShieldOff } from 'lucide-react'

/**
 * Dialog to create a suppression rule pre-filled from the alert's signature.
 * @param {{open: boolean, alert?: object|null, dryRun?: {would_hide: number, samples: string[]}|null,
 *   dryRunLoading?: boolean, busy?: boolean, onClose: () => void,
 *   onCreate: (rule: object) => void}} props
 */
function SuppressionDialog({ open, alert, dryRun, dryRunLoading = false, busy = false, onClose, onCreate }) {
  const [name, setName] = useState(() => (alert ? `Ignore ${alert.suricata.signature}` : ''))
  const [reason, setReason] = useState(() =>
    alert ? `Created from alert ${alert.id} (${alert.suricata.category}).` : '',
  )

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !alert) return null

  const match = { signature_id: alert.suricata.signature_id }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create suppression rule"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-xl"
      >
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
          <ShieldOff className="h-4 w-4" aria-hidden="true" />
          Create suppression rule
        </h2>

        <label className="mt-3 block text-xs text-muted">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="mt-3 block text-xs text-muted">
          Reason
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <div className="mt-3 rounded-md border border-border bg-surface-2/50 px-2.5 py-2 text-xs">
          <p className="text-muted">
            Match: signature id{' '}
            <span className="font-mono text-text">{alert.suricata.signature_id}</span>
          </p>
          <p className="mt-1 inline-flex items-center gap-2 text-muted">
            {dryRunLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Dry-run…
              </>
            ) : dryRun ? (
              <>
                Would hide <span className="font-semibold text-text">{dryRun.would_hide}</span> existing
                alert{dryRun.would_hide === 1 ? '' : 's'}
              </>
            ) : (
              'Dry-run unavailable'
            )}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() => onCreate({ name: name.trim(), reason: reason.trim(), enabled: true, match })}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create rule'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuppressionDialog


























