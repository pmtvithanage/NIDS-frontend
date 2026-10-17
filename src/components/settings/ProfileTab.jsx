import { ShieldCheck } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth.js'
import { ROLE_LABELS } from '../../constants/settings.js'

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-text">{value ?? '—'}</dd>
    </div>
  )
}

/** Current operator profile (read-only). */
function ProfileTab() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{user?.name ?? 'Operator'}</p>
          <p className="text-xs text-muted">{ROLE_LABELS[user?.role] ?? user?.role ?? 'Unknown role'}</p>
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
        <Field label="Name" value={user?.name} />
        <Field label="Email" value={user?.email} />
        <Field label="Role" value={ROLE_LABELS[user?.role] ?? user?.role} />
        <Field label="Session" value={user?.role === 'viewer' ? 'Read-only' : 'Full access'} />
      </dl>

      <p className="text-xs text-muted">
        Profile details are managed by your directory administrator and cannot be edited here.
      </p>
    </div>
  )
}

export default ProfileTab
