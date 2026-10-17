import { memo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowRightLeft, Check, Copy, HelpCircle } from 'lucide-react'

const DIRECTION = {
  inbound: { Icon: ArrowLeft, label: 'inbound' },
  outbound: { Icon: ArrowRight, label: 'outbound' },
  internal: { Icon: ArrowRightLeft, label: 'internal' },
}

/**
 * Flow tuple: src -> dst:port with a direction arrow and copy button.
 * @param {{src_ip?: string|null, dst_ip?: string|null, dst_port?: number|null,
 *   direction?: string, protocol?: string, copyable?: boolean, className?: string}} props
 */
function FlowTuple({
  src_ip,
  dst_ip,
  dst_port,
  direction = 'internal',
  protocol,
  copyable = true,
  className = '',
}) {
  const [copied, setCopied] = useState(false)
  const { Icon, label } = DIRECTION[direction] ?? DIRECTION.internal

  if (!src_ip || !dst_ip) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-muted ${className}`}>
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        no IP tuple &middot; {protocol ?? 'decode'}
      </span>
    )
  }

  const tuple = `${src_ip} \u2192 ${dst_ip}:${dst_port ?? ''}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tuple)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable; ignore.
    }
  }

  return (
    <span className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted" aria-label={label} title={label} />
      <span className="font-mono text-text">
        {src_ip} <span className="text-muted">&rarr;</span> {dst_ip}
        {dst_port ? <span className="text-muted">:{dst_port}</span> : null}
      </span>
      {copyable ? (
        <button
          type="button"
          onClick={copy}
          aria-label="Copy flow tuple"
          className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-text"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-sev-low" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </span>
  )
}

export default memo(FlowTuple)
