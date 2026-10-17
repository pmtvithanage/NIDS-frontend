import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import SuppressionMatchFields from './SuppressionMatchFields.jsx'
import Toggle from '../common/Toggle.jsx'
import { useCreateSuppression, useDryRunSuppression, useUpdateSuppression } from '../../hooks/useSuppressions.js'
import { useToast } from '../../hooks/useToast.js'
import { buildMatch, fromLocalInput, initialRuleForm, validateRuleForm } from '../../utils/suppressionForm.js'

/**
 * Create/edit dialog for a suppression rule with a dry-run impact preview.
 * @param {{rule?: object|null, onClose: () => void, onSaved: () => void}} props
 */
function SuppressionRuleDialog({ rule, onClose, onSaved }) {
  const { toast } = useToast()
  const dryRun = useDryRunSuppression()
  const createSuppression = useCreateSuppression()
  const updateSuppression = useUpdateSuppression()
  const [form, setForm] = useState(() => initialRuleForm(rule))
  const [error, setError] = useState('')

  const editing = Boolean(rule?.id)
  const busy = createSuppression.isPending || updateSuppression.isPending

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    dryRun.reset()
    setError('')
  }

  const payload = () => ({
    name: form.name.trim(),
    reason: form.reason.trim(),
    enabled: form.enabled,
    match: buildMatch(form),
    max_severity: form.maxSeverity || null,
    expires_at: fromLocalInput(form.expiresAt),
  })

  const handlePreview = () => {
    const message = validateRuleForm(form)
    if (message) {
      setError(message)
      return
    }
    dryRun.mutate(payload())
  }

  const handleSubmit = async () => {
    const message = validateRuleForm(form)
    if (message) {
      setError(message)
      return
    }
    try {
      if (editing) await updateSuppression.mutateAsync({ id: rule.id, patch: payload() })
      else await createSuppression.mutateAsync(payload())
      toast(editing ? 'Rule updated' : 'Rule created', { variant: 'success' })
      onSaved()
      onClose()
    } catch (caught) {
      toast(caught?.message ?? 'Could not save rule', { variant: 'error' })
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Edit suppression rule' : 'Create suppression rule'}
        onClick={(event) => event.stopPropagation()}
        className="my-8 w-full max-w-lg rounded-lg border border-border bg-surface p-4 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-text">
          {editing ? 'Edit suppression rule' : 'Create suppression rule'}
        </h2>

        <SuppressionMatchFields form={form} onChange={setField} />

        <div className="mt-3 flex items-center justify-between gap-3">
          <Toggle label="Enabled" checked={form.enabled} onChange={(v) => setField('enabled', v)} />
          <button
            type="button"
            onClick={handlePreview}
            disabled={dryRun.isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:bg-surface-2 disabled:opacity-60"
          >
            {dryRun.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            Preview impact
          </button>
        </div>

        <div className="mt-2 rounded-md border border-border bg-surface-2/50 px-2.5 py-2 text-xs">
          {dryRun.data ? (
            <span className="text-muted">
              Would have hidden <span className="font-semibold text-text">{dryRun.data.would_hide}</span> alert
              {dryRun.data.would_hide === 1 ? '' : 's'} in the last 7 days
            </span>
          ) : (
            <span className="text-muted">Run a dry-run to preview how many alerts this rule hides.</span>
          )}
        </div>

        {error ? <p className="mt-2 text-xs text-sev-critical">{error}</p> : null}

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
            disabled={busy}
            onClick={handleSubmit}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg disabled:opacity-60"
          >
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create rule'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuppressionRuleDialog
