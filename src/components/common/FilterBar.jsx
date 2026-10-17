/**
 * Layout helper that groups filter controls.
 * @param {{children: import('react').ReactNode, onClear?: () => void, className?: string}} props
 */
function FilterBar({ children, onClear, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2 ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}

export default FilterBar
