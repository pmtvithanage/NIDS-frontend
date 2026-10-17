import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import HostAlertHistory from '../components/hosts/HostAlertHistory.jsx'
import HostFactsCard from '../components/hosts/HostFactsCard.jsx'
import HostSuppressionDialog from '../components/hosts/HostSuppressionDialog.jsx'
import PeerGraph from '../components/hosts/PeerGraph.jsx'
import PortsChart from '../components/hosts/PortsChart.jsx'
import { useHost } from '../hooks/useHosts.js'

/** Host-centric profile: facts, ports, peer graph, history and suppression. */
function HostDetail() {
  const { ip } = useParams()
  const navigate = useNavigate()
  const [suppressOpen, setSuppressOpen] = useState(false)
  const { data: host, isLoading, isError, error, refetch } = useHost(ip)

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      {isLoading ? <LoadingSkeleton rows={8} /> : null}
      {isError ? <ErrorState error={error} onRetry={refetch} /> : null}
      {!isLoading && !isError && !host ? (
        <EmptyState title="Host not found" description={`No alerts reference host ${ip}.`} />
      ) : null}

      {host ? (
        <>
          <HostFactsCard host={host} onSuppress={() => setSuppressOpen(true)} />

          <div className="grid gap-4 xl:grid-cols-2">
            <PortsChart ports={host.ports_contacted} />
            <PeerGraph ip={host.ip} peers={host.peers} />
          </div>

          <HostAlertHistory history={host.alert_history} />

          {suppressOpen ? (
            <HostSuppressionDialog host={host} onClose={() => setSuppressOpen(false)} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default HostDetail
