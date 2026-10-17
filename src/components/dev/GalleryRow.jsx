/**
 * Labelled row used by the component gallery.
 * @param {{label: string, children: import('react').ReactNode}} props
 */
function GalleryRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border py-3">
      <span className="w-40 shrink-0 text-xs font-medium text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  )
}

export default GalleryRow
