/**
 * Card wrapper for a chart or panel, with a title, optional description and
 * optional header actions.
 * @param {{title: string, description?: string, action?: import('react').ReactNode,
 *   children: import('react').ReactNode, className?: string}} props
 */
function ChartCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default ChartCard
