import { useSyncExternalStore } from 'react'

import { formatTs } from '../../../utils/format.js'

/**
 * Live "updated at" label. Subscribes to the metrics external store so only this
 * line re-renders when a new point arrives — never the whole Overview page.
 * @param {{
 *   subscribeLatest: (listener: () => void) => () => void,
 *   getLatestSnapshot: () => {latest: object|null, pausedCount: number},
 * }} props
 */
function LiveUpdatedAt({ subscribeLatest, getLatestSnapshot }) {
  const { latest, pausedCount } = useSyncExternalStore(
    subscribeLatest,
    getLatestSnapshot,
    getLatestSnapshot,
  )

  return (
    <>
      {latest ? `Updated ${formatTs(latest.ts)}` : 'Waiting for metrics…'}
      {pausedCount > 0 ? ` · ${pausedCount} paused` : ''}
    </>
  )
}

export default LiveUpdatedAt
