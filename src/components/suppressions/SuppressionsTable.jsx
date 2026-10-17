import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import SeverityBadge from '../common/SeverityBadge.jsx'
import { formatTs } from '../../utils/format.js'

function cidrOrAny(value) {
  return value ? <span className="font-mono text-xs">{value}</span> : <span className="text-muted">any</span>
}

/**
 * Table of suppression rules with edit/delete actions.
 * @param {{data: object[], onEdit: (rule: object) => void, onDelete: (rule: object) => void}} props
 */
function SuppressionsTable({ data, onEdit, onDelete }) {
  const [now] = useState(() => Date.now())
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-3 py-2 font-medium">Name</th>
            <th scope="col" className="px-3 py-2 font-medium">Signature</th>
            <th scope="col" className="px-3 py-2 font-medium">Source</th>
            <th scope="col" className="px-3 py-2 font-medium">Destination</th>
            <th scope="col" className="px-3 py-2 font-medium">Port</th>
            <th scope="col" className="px-3 py-2 font-medium">Max severity</th>
            <th scope="col" className="px-3 py-2 font-medium">Expiry</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Hits</th>
            <th scope="col" className="px-3 py-2 font-medium">Creator</th>
            <th scope="col" className="px-3 py-2 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((rule) => {
            const match = rule.match ?? {}
            const expired = rule.expires_at && new Date(rule.expires_at).getTime() < now
            return (
              <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text">{rule.name}</span>
                    {!rule.enabled ? (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase text-muted">
                        disabled
                      </span>
                    ) : null}
                  </div>
                  {match.q ? <p className="mt-0.5 text-xs text-muted">matches &ldquo;{match.q}&rdquo;</p> : null}
                  {rule.reason ? <p className="mt-0.5 max-w-xs truncate text-xs text-muted">{rule.reason}</p> : null}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted">{match.signature_id ?? '—'}</td>
                <td className="px-3 py-2">{cidrOrAny(match.src_cidr)}</td>
                <td className="px-3 py-2">{cidrOrAny(match.dst_cidr)}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted">{match.dst_port ?? 'any'}</td>
                <td className="px-3 py-2">
                  {rule.max_severity ? <SeverityBadge tier={rule.max_severity} /> : <span className="text-muted">Any</span>}
                </td>
                <td className="px-3 py-2 text-xs tabular-nums text-muted">
                  {rule.expires_at ? (
                    <span className={expired ? 'text-sev-critical' : undefined}>
                      {formatTs(rule.expires_at)}
                      {expired ? ' (expired)' : ''}
                    </span>
                  ) : (
                    'Never'
                  )}
                </td>
                <td className="px-3 py-2 text-right text-xs tabular-nums text-text">{rule.hit_count ?? 0}</td>
                <td className="px-3 py-2 text-xs text-muted">{rule.created_by}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(rule)}
                      aria-label={`Edit ${rule.name}`}
                      className="rounded p-1 text-muted hover:bg-surface-2 hover:text-text"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(rule)}
                      aria-label={`Delete ${rule.name}`}
                      className="rounded p-1 text-muted hover:bg-surface-2 hover:text-sev-critical"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default SuppressionsTable
