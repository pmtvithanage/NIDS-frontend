import ChartCard from '../components/common/ChartCard.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import AEHistogram from '../components/models/AEHistogram.jsx'
import ConfidenceHistogram from '../components/models/ConfidenceHistogram.jsx'
import EnginePrecisionChart from '../components/models/EnginePrecisionChart.jsx'
import FeatureDriftTable from '../components/models/FeatureDriftTable.jsx'
import FusionReviewPanel from '../components/models/FusionReviewPanel.jsx'
import LabelDistributionChart from '../components/models/LabelDistributionChart.jsx'
import { useModelInsights } from '../hooks/useStats.js'

/** Model insights: distributions, drift, engine feedback and fusion review. */
function Models() {
  const query = useModelInsights()
  const data = query.data

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-text">Models</h1>
        <p className="text-xs text-muted">Classifier, autoencoder and fusion health across the alert stream.</p>
      </header>

      {query.isLoading ? <LoadingSkeleton rows={8} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="MLP label distribution" description="Predicted class share across alerts.">
              <LabelDistributionChart distribution={data.label_distribution} />
            </ChartCard>
            <ChartCard title="MLP confidence" description="Distribution of classifier confidence scores.">
              <ConfidenceHistogram bins={data.confidence_histogram} />
            </ChartCard>
          </div>

          <ChartCard
            title="Autoencoder reconstruction error"
            description={`Bars at or past the anomaly threshold (${data.ae_error_histogram.threshold}) are flagged.`}
          >
            <AEHistogram bins={data.ae_error_histogram.bins} threshold={data.ae_error_histogram.threshold} />
          </ChartCard>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Engine precision over time" description="Precision per engine, by day, from analyst verdicts.">
              <EnginePrecisionChart points={data.precision_over_time} metric="precision" />
            </ChartCard>
            <ChartCard title="Engine recall over time" description="Recall per engine, by day, from analyst verdicts.">
              <EnginePrecisionChart points={data.precision_over_time} metric="recall" />
            </ChartCard>
          </div>

          <ChartCard title="Feature drift" description="Recent window vs earlier baseline mean per feature.">
            <FeatureDriftTable rows={data.feature_drift} />
          </ChartCard>

          <ChartCard title="Fusion review" description="How often CRITICAL alerts rested on a single weak engine.">
            <FusionReviewPanel review={data.fusion_review} />
          </ChartCard>
        </>
      ) : null}
    </div>
  )
}

export default Models
