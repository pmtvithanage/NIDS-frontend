import { useState } from 'react'
import { Loader2, ShieldOff } from 'lucide-react'

import { MAX_SEVERITY_OPTIONS } from '../../constants/suppressions.js'
import { useCreateSuppression, useDryRunSuppression } from '../../hooks/useSuppressions.js'
import { useToast } from '../../hooks/useToast.js'

const SELECT_CLASS =
  'mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent'

function ruleFor(host, { name, reason, scope, maxSeverity }) {
  const match =
    scope === 'source'
      ? { src_cidr: `${host.ip}/32` }
      : scope === 'target'
        ? { dst_cidr: `${host.ip}/32` }
        : { q: host.ip }
  return { name, reason, enabled: true, match, max_severity: maxSeverity || null, expires_at: null }
}

/**
 * Dialog that creates a suppression rule scoped to a single host, with a
 * dry-run impact preview.
 * @param {{host: object, onClose: () => void, onCreated?: () => void}} props
 */
function HostSuppressionDialog({ host, onClose, onCreated }) {
  const { toast } = useToast()
  const dryRun = useDryRunSuppression()
  const createSuppression = useCreateSuppression()

  const [name, setName] = useState(`Suppress host ${host.ip}`)
  const [reason, setReason] = useState(`Created from the host profile for ${host.ip}.`)
  const [scope, setScope] = useState('any')
  const [maxSeverity, setMaxSeverity] = useState('')

  const buildRule = () => ruleFor(host, { name: name.trim(), reason: reason.trim(), scope, maxSeverity })

  const resetPreview = () => dryRun.reset()

  const handleSubmit = async () => {
    try {
      await createSuppression.mutateAsync(buildRule())
      toast('Suppression rule created', { variant: 'success' })
      onCreated?.()
      onClose()
    } catch (error) {
      toast(error?.message ?? 'Could not create suppression', { variant: 'error' })
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create host suppression"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-xl"
      >
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
          <ShieldOff className="h-4 w-4" aria-hidden="true" />
          Create suppression for {host.ip}
        </h2>

        <label className="mt-3 block text-xs text-muted">
          Name
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              resetPreview()
            }}
            className={SELECT_CLASS}
          />
        </label>

        <label className="mt-3 block text-xs text-muted">
          Reason
          <textarea
            rows={2}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              resetPreview()
            }}
            className={SELECT_CLASS}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Scope
            <select
              value={scope}
              onChange={(event) => {
                setScope(event.target.value)
                resetPreview()
              }}
              className={SELECT_CLASS}
            >
              <option value="any">Any direction</option>
              <option value="source">As source</option>
              <option value="target">As target</option>
            </select>
          </label>
          <label className="block text-xs text-muted">
            Max severity
            <select
              value={maxSeverity}
              onChange={(event) => {
                setMaxSeverity(event.target.value)
                resetPreview()
              }}
              className={SELECT_CLASS}
            >
              {MAX_SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 rounded-md border border-border bg-surface-2/50 px-2.5 py-2 text-xs">
          {dryRun.isPending ? (
            <span className="inline-flex items-center gap-2 text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Dry-run…
            </span>
          ) : dryRun.data ? (
            <span className="text-muted">
              Would have hidden <span className="font-semibold text-text">{dryRun.data.would_hide}</span> alert
              {dryRun.data.would_hide === 1 ? '' : 's'} in the last 7 days
            </span>
          ) : (
            <button
              type="button"
              onClick={() => dryRun.mutate(buildRule())}
              className="text-accent hover:underline"
            >
              Preview impact
            </button>
          )}
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
            disabled={createSuppression.isPending || !name.trim()}
            onClick={handleSubmit}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg disabled:opacity-60"
          >
            {createSuppression.isPending ? 'Creating…' : 'Create rule'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HostSuppressionDialog
