import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const VARIANTS = {
  success: { icon: CheckCircle2, className: 'text-sev-low' },
  error: { icon: AlertTriangle, className: 'text-sev-critical' },
  warning: { icon: AlertTriangle, className: 'text-sev-medium' },
  info: { icon: Info, className: 'text-accent' },
}

/**
 * A single toast notification.
 * @param {{toast: {id:string, message:string, title?:string, variant?:string}, onDismiss: (id:string)=>void}} props
 */
function Toast({ toast, onDismiss }) {
  const variant = VARIANTS[toast.variant] ?? VARIANTS.info
  const Icon = variant.icon

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-80 items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg"
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${variant.className}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {toast.title ? <p className="text-sm font-medium text-text">{toast.title}</p> : null}
        <p className="text-sm text-muted">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="rounded p-1 text-muted hover:bg-surface-2 hover:text-text"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export default Toast
