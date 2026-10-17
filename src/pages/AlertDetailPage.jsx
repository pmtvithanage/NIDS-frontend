import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AlertDetailHeader from '../components/alerts/AlertDetailHeader.jsx'
import AnalystActions from '../components/alerts/AnalystActions.jsx'
import AnomalyChart from '../components/alerts/AnomalyChart.jsx'
import EnginePanel from '../components/alerts/EnginePanel.jsx'
import FeatureVectorTable from '../components/alerts/FeatureVectorTable.jsx'
import FlowSummary from '../components/alerts/FlowSummary.jsx'
import LabelDialog from '../components/alerts/LabelDialog.jsx'
import LowEvidenceBanner from '../components/alerts/LowEvidenceBanner.jsx'
import PcapHintCard from '../components/alerts/PcapHintCard.jsx'
import PrevNextNav from '../components/alerts/PrevNextNav.jsx'
import RawJsonTabs from '../components/alerts/RawJsonTabs.jsx'
import RelatedAlerts from '../components/alerts/RelatedAlerts.jsx'
import SuppressionDialog from '../components/alerts/SuppressionDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import { useAlertDetail, useAlertExplain, useAlertPcapHint } from '../hooks/useAlerts.js'
import { buildSuppressionRule, useAlertDetailActions } from '../hooks/useAlertDetailActions.js'

/**
 * Single alert detail page: header, engine panels, explainability, flow summary,
 * 78-column feature vector, raw JSON and analyst actions.
 */
function AlertDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const detailQuery = useAlertDetail(id)
  const detail = detailQuery.data
  const explainQuery = useAlertExplain(id)
  const pcapQuery = useAlertPcapHint(id)
  const actions = useAlertDetailActions(id, detail)

  const navState = location.state
  const alertIds = useMemo(
    () => (Array.isArray(navState?.alertIds) ? navState.alertIds : []),
    [navState],
  )
  const index = typeof navState?.index === 'number' ? navState.index : -1
  const search = typeof navState?.search === 'string' ? navState.search : ''
  const backTo = search ? `/alerts?${search}` : '/alerts'
  const prevId = index > 0 ? alertIds[index - 1] : null
  const nextId = index >= 0 && index < alertIds.length - 1 ? alertIds[index + 1] : null

  const handleNavigate = useCallback(
    (targetId, targetIndex) => {
      if (!targetId) return
      navigate(`/alerts/${targetId}`, { state: { alertIds, index: targetIndex, search } })
    },
    [navigate, alertIds, search],
  )

  const features = explainQuery.data?.top_features ?? detail?.explain?.top_features ?? []

  return (
    <div className="space-y-4">
      <PrevNextNav
        backTo={backTo}
        prevId={prevId}
        nextId={nextId}
        position={index}
        total={alertIds.length}
        onNavigate={handleNavigate}
      />

      {detailQuery.isLoading ? <LoadingSkeleton rows={8} /> : null}
      {detailQuery.isError ? (
        <ErrorState error={detailQuery.error} onRetry={detailQuery.refetch} />
      ) : null}
      {!detailQuery.isLoading && !detailQuery.isError && !detail ? (
        <EmptyState title="Alert not found" description={`No alert matches id ${id}.`} />
      ) : null}

      {detail ? (
        <>
          <AlertDetailHeader
            detail={detail}
            busy={actions.patchBusy}
            onSetStatus={actions.setStatus}
            onAssign={actions.setAssignee}
          />

          <LowEvidenceBanner
            detail={detail}
            suppressing={actions.suppressBusy}
            onSuppress={() => actions.createRule(buildSuppressionRule(detail), 'Rule created')}
          />

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <EnginePanel engines={detail.engines} />

              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-text">Why was this flagged?</h2>
                <p className="text-xs text-muted">
                  Top anomalous flow features by standard deviations from normal (z-score).
                </p>
                <AnomalyChart features={features} />
              </section>

              <FlowSummary flow={detail.flow} featureVector={detail.feature_vector} />
              <FeatureVectorTable vector={detail.feature_vector} zScores={detail.feature_z} />
            </div>

            <div className="space-y-4">
              <AnalystActions
                key={detail.id}
                detail={detail}
                savingNotes={actions.patchBusy}
                suppressBusy={actions.suppressBusy}
                onSaveNotes={actions.saveNotes}
                onOpenLabel={actions.openLabel}
                onOpenSuppress={actions.openSuppress}
              />
              <PcapHintCard hint={pcapQuery.data} loading={pcapQuery.isLoading} />
              <RelatedAlerts alerts={detail.related_alerts} />
            </div>
          </div>

          <RawJsonTabs detail={detail} />
        </>
      ) : null}

      {actions.labelOpen ? (
        <LabelDialog
          open
          currentLabel={detail?.human_label ?? null}
          busy={actions.labelBusy}
          onClose={actions.closeLabel}
          onSubmit={actions.submitLabel}
        />
      ) : null}
      {actions.suppressOpen ? (
        <SuppressionDialog
          open
          alert={detail}
          dryRun={actions.dryRun.data}
          dryRunLoading={actions.dryRun.isPending}
          busy={actions.suppressBusy}
          onClose={actions.closeSuppress}
          onCreate={(rule) => actions.createRule(rule, 'Suppression rule created')}
        />
      ) : null}
    </div>
  )
}

export default AlertDetailPage
