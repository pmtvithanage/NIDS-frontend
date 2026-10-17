/**
 * Small labeled toggle switch.
 * @param {{label: string, checked: boolean, onChange: (checked: boolean) => void, className?: string}} props
 */
function Toggle({ label, checked, onChange, className = '' }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-xs text-muted ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-4 w-7 rounded-full bg-surface-2 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-text after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-3"
      />
      <span>{label}</span>
    </label>
  )
}

export default Toggle
