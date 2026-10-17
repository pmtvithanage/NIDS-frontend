import { memo } from 'react'
import { ArrowUpRight, Check, ShieldX } from 'lucide-react'

import { ALERT_ROW_HEIGHT } from '../../constants/alerts.js'

const QUICK_ACTION_CLASS =
  'rounded p-1 text-muted hover:bg-surface hover:text-text focus:outline-none focus:ring-1 focus:ring-accent'

/**
 * A single virtualized alert row: checkbox, data cells, hover quick actions.
 * @param {{table: object, row: object, top: number, template: string,
 *   selected: boolean, focused: boolean,
 *   onToggle: (id: string, checked: boolean) => void,
 *   onOpen: (id: string) => void,
 *   onQuickAction: (action: string, id: string) => void}} props
 */
function AlertRow({ table, row, top, template, selected, focused, onToggle, onOpen, onQuickAction }) {
  const alert = row.original

  const onClick = (event) => {
    if (event.target.closest('button, a, input')) return
    onOpen(alert.id)
  }

  return (
    <div
      role="row"
      aria-selected={selected}
      onClick={onClick}
      className={`group grid items-center border-b border-border ${
        selected ? 'bg-accent/10' : focused ? 'bg-surface-2' : 'hover:bg-surface-2/60'
      }`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${top}px)`,
        gridTemplateColumns: template,
        height: ALERT_ROW_HEIGHT,
      }}
    >
      <div role="cell" className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onToggle(alert.id, event.target.checked)}
          aria-label={`Select alert ${alert.id}`}
          className="h-3.5 w-3.5 accent-[var(--accent)]"
        />
      </div>

      {row.getAllCells().map((cell) => (
        <div key={cell.id} role="cell" className="min-w-0 px-2">
          <table.FlexRender cell={cell} />
        </div>
      ))}

      <div role="cell" className="flex items-center justify-center gap-0.5 opacity-0 focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          className={QUICK_ACTION_CLASS}
          title="Acknowledge (a)"
          aria-label={`Acknowledge ${alert.id}`}
          onClick={() => onQuickAction('acknowledge', alert.id)}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={QUICK_ACTION_CLASS}
          title="Mark false positive (f)"
          aria-label={`Mark ${alert.id} as false positive`}
          onClick={() => onQuickAction('false_positive', alert.id)}
        >
          <ShieldX className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={QUICK_ACTION_CLASS}
          title="Open detail (Enter)"
          aria-label={`Open ${alert.id}`}
          onClick={() => onOpen(alert.id)}
        >
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default memo(AlertRow)
