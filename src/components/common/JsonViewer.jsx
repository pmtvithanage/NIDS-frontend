import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react'

/**
 * Collapsible JSON viewer with a copy button.
 * @param {{data: any, title?: string, defaultOpen?: boolean, className?: string}} props
 */
function JsonViewer({ data, title = 'JSON', defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const text = JSON.stringify(data, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable; ignore.
    }
  }

  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {title}
        </button>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy JSON"
          className="rounded p-1 text-muted hover:bg-surface-2 hover:text-text"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-sev-low" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
      {open ? (
        <pre className="max-h-80 overflow-auto p-3 text-[11px] leading-relaxed text-muted">
          <code>{text}</code>
        </pre>
      ) : null}
    </div>
  )
}

export default JsonViewer
