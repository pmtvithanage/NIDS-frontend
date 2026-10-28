import { lazy, Suspense } from 'react'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'

const CommunicationGraph = lazy(() => import('./CommunicationGraph.jsx'))

/**
 * Lazy-loaded wrapper for CommunicationGraph to keep initial bundle small.
 */
function CommunicationGraphWrapper() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={6} />}>
      <CommunicationGraph />
    </Suspense>
  )
}

export default CommunicationGraphWrapper
























