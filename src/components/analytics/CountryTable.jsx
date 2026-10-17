import EmptyState from '../common/EmptyState.jsx'

/**
 * External-peer countries by alert volume, with share bars.
 * @param {{countries?: Array<{country: string, count: number, share: number}>}} props
 */
function CountryTable({ countries = [] }) {
  if (countries.length === 0) {
    return <EmptyState title="No external peers" description="No destination countries were observed." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Country</th>
            <th scope="col" className="py-2 pr-3 font-medium">Alerts</th>
            <th scope="col" className="py-2 font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((entry) => (
            <tr key={entry.country} className="border-b border-border last:border-0">
              <td className="py-2 pr-3 text-text">{entry.country}</td>
              <td className="py-2 pr-3 tabular-nums text-muted">{entry.count}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round(entry.share * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted">{Math.round(entry.share * 100)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CountryTable
