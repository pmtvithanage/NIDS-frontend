import { Inbox } from 'lucide-react'

/**
 * Neutral empty-state block.
 * @param {{title?: string, description?: string, icon?: Function, action?: import('react').ReactNode, className?: string}} props
 */
function EmptyState({ title = 'Nothing here', description, icon: Icon = Inbox, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2 py-12 text-center ${className}`}>
      <Icon className="h-8 w-8 text-muted" aria-hidden="true" />
      <p className="text-sm font-medium text-text">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export default EmptyState
