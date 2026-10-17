import { Bell, Pause, Play } from 'lucide-react'

/**
 * Sticky live-feed banner. New alerts are buffered (never shift the table) and
 * surfaced here; the pause control unsubscribes from the stream.
 * @param {{count: number, paused: boolean, onShow: () => void, onTogglePause: () => void}} props
 */
function NewAlertsBanner({ count, paused, onShow, onTogglePause }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 bg-bg/85 py-1 backdrop-blur">
      {count > 0 ? (
        <button
          type="button"
          onClick={onShow}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/15 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/25"
        >
          <Bell className="h-3.5 w-3.5" aria-hidden="true" />
          {count} new alert{count === 1 ? '' : 's'}
          <span className="text-accent/80">— click to show</span>
        </button>
      ) : (
        <span aria-live="polite" className="text-xs text-muted">
          {paused ? 'Live feed paused' : 'Live'}
        </span>
      )}
      <button
        type="button"
        onClick={onTogglePause}
        aria-pressed={paused}
        className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text hover:bg-surface-2"
      >
        {paused ? (
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {paused ? 'Resume live' : 'Pause live'}
      </button>
    </div>
  )
}

export default NewAlertsBanner
