import { MAX_SEVERITY_OPTIONS } from '../../constants/suppressions.js'

export const FIELD_CLASS =
  'mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent'

/**
 * Field grid for a suppression rule form (name, reason, match conditions,
 * severity cap and expiry). Purely presentational.
 * @param {{form: object, onChange: (key: string, value: any) => void}} props
 */
function SuppressionMatchFields({ form, onChange }) {
  return (
    <>
      <label className="mt-3 block text-xs text-muted">
        Name
        <input value={form.name} onChange={(e) => onChange('name', e.target.value)} className={FIELD_CLASS} />
      </label>

      <label className="mt-3 block text-xs text-muted">
        Reason
        <textarea
          rows={2}
          value={form.reason}
          onChange={(e) => onChange('reason', e.target.value)}
          className={FIELD_CLASS}
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-xs text-muted">
          Signature id
          <input
            value={form.signatureId}
            onChange={(e) => onChange('signatureId', e.target.value)}
            placeholder="e.g. 2200073"
            className={FIELD_CLASS}
          />
        </label>
        <label className="block text-xs text-muted">
          Destination port
          <input
            value={form.dstPort}
            onChange={(e) => onChange('dstPort', e.target.value)}
            placeholder="e.g. 443"
            className={FIELD_CLASS}
          />
        </label>
        <label className="block text-xs text-muted">
          Source CIDR
          <input
            value={form.srcCidr}
            onChange={(e) => onChange('srcCidr', e.target.value)}
            placeholder="192.168.8.0/24"
            className={FIELD_CLASS}
          />
        </label>
        <label className="block text-xs text-muted">
          Destination CIDR
          <input
            value={form.dstCidr}
            onChange={(e) => onChange('dstCidr', e.target.value)}
            placeholder="10.0.0.0/8"
            className={FIELD_CLASS}
          />
        </label>
        <label className="block text-xs text-muted">
          Max severity
          <select
            value={form.maxSeverity}
            onChange={(e) => onChange('maxSeverity', e.target.value)}
            className={FIELD_CLASS}
          >
            {MAX_SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-muted">
          Expires
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => onChange('expiresAt', e.target.value)}
            className={FIELD_CLASS}
          />
        </label>
      </div>
    </>
  )
}

export default SuppressionMatchFields
