import { useMemo } from 'react'

import ChartCard from '../components/common/ChartCard.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import CountryTable from '../components/analytics/CountryTable.jsx'
import FeatureScatter from '../components/analytics/FeatureScatter.jsx'
import HeatmapGrid from '../components/analytics/HeatmapGrid.jsx'
import PortsDistributionChart from '../components/analytics/PortsDistributionChart.jsx'
import ProtocolDistributionChart from '../components/analytics/ProtocolDistributionChart.jsx'
import TopTalkersTable from '../components/analytics/TopTalkersTable.jsx'
import { useAnalyticsOverview } from '../hooks/useAnalytics.js'
import { useTimezone } from '../hooks/usePreferences.js'

/** Traffic and detection analytics: density, distributions and exploration. */
function Analytics() {
  const { timezone } = useTimezone()
  const params = useMemo(() => ({ timezone }), [timezone])
  const query = useAnalyticsOverview(params)
  const data = query.data

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-text">Analytics</h1>
        <p className="text-xs text-muted">
          Traffic patterns, top talkers and flow-feature exploration across {data?.total ?? 0} alerts.
        </p>
      </header>

      {query.isLoading ? <LoadingSkeleton rows={8} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}

      {data ? (
        <>
          <ChartCard
            title="Alert density"
            description={`Hour × weekday heatmap in ${data.timezone}.`}
          >
            <HeatmapGrid heatmap={data.heatmap} />
          </ChartCard>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Top destination ports" description="Most frequently targeted ports.">
              <PortsDistributionChart ports={data.ports} />
            </ChartCard>
            <ChartCard title="Protocol distribution" description="Share of alerts per protocol.">
              <ProtocolDistributionChart protocols={data.protocols} />
            </ChartCard>
          </div>

          <ChartCard title="Top talkers" description="Most active sources and destinations.">
            <TopTalkersTable sources={data.top_sources} destinations={data.top_destinations} />
          </ChartCard>

          <ChartCard
            title="Flow-feature explorer"
            description="Pick two numeric features; points are colored by MLP label."
          >
            <FeatureScatter />
          </ChartCard>

          <ChartCard title="External peer countries" description="Destination countries of observed peers.">
            <CountryTable countries={data.countries} />
          </ChartCard>
        </>
      ) : null}
    </div>
  )
}

export default Analytics
