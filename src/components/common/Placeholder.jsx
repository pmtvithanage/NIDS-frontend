/**
 * Reusable placeholder page used while routes are being built out.
 * @param {{ title: string, description?: string }} props
 * @returns {import('react').JSX.Element}
 */
function Placeholder({ title, description }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      {description ? <p className="mt-2 text-muted">{description}</p> : null}
    </section>
  )
}

export default Placeholder
