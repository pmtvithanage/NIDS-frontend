import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getMetricsHistory, subscribeMetrics } from '../api/metrics.js'
import { useLiveMetrics } from '../hooks/useLiveMetrics.js'

vi.mock('../api/metrics.js', () => ({
  getMetricsHistory: vi.fn(),
  subscribeMetrics: vi.fn(),
}))

function point(ts) {
  return {
    ts,
    alerts: { critical: 0, high: 0, medium: 0, low: 0 },
    flows_per_sec: 1,
    bytes_per_sec: 1,
    ae_ratio_p50: 1,
    ae_ratio_p95: 1,
    ae_ratio_max: 1,
    mlp_conf_avg: 0.9,
    kafka_lag: 0,
    ingest_errors: 0,
    suricata_events_per_sec: 0,
  }
}

const HISTORY = [point('2026-01-01T00:00:00Z'), point('2026-01-01T00:00:01Z')]

function setup(history = HISTORY) {
  let emitFn = null
  let unsubscribed = false
  getMetricsHistory.mockResolvedValue(history)
  subscribeMetrics.mockImplementation((onPoint) => {
    emitFn = onPoint
    return () => {
      unsubscribed = true
    }
  })
  return {
    emit: (next) => emitFn(next),
    wasUnsubscribed: () => unsubscribed,
  }
}

describe('useLiveMetrics', () => {
  let nowValue

  beforeEach(() => {
    nowValue = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => nowValue)
  })

  afterEach(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  })

  it('seeds the buffer from history then publishes live ticks after the flush window', async () => {
    const control = setup()
    const { result } = renderHook(() => useLiveMetrics())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.getPoints()).toHaveLength(2)
    expect(result.current.getLatestSnapshot().latest?.ts).toBe('2026-01-01T00:00:01Z')

    nowValue += 1_000
    act(() => control.emit(point('2026-01-01T00:00:02Z')))

    expect(result.current.getPoints()).toHaveLength(3)
    expect(result.current.getLatestSnapshot().latest?.ts).toBe('2026-01-01T00:00:02Z')

    act(() => result.current.reload())
    await waitFor(() => expect(getMetricsHistory).toHaveBeenCalledTimes(2))
  })

  it('counts paused points and resets the count on resume', async () => {
    const control = setup()
    const { result } = renderHook(() => useLiveMetrics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.pause())
    expect(result.current.paused).toBe(true)

    act(() => control.emit(point('2026-01-01T00:00:03Z')))
    expect(result.current.getLatestSnapshot().pausedCount).toBe(1)

    act(() => result.current.resume())
    expect(result.current.paused).toBe(false)
    expect(result.current.getLatestSnapshot().pausedCount).toBe(0)
  })

  it('drops points while hidden and refills from history when visible again', async () => {
    const control = setup()
    const { result } = renderHook(() => useLiveMetrics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(getMetricsHistory).toHaveBeenCalledTimes(1)

    getMetricsHistory.mockClear()
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    act(() => control.emit(point('2026-01-01T00:00:09Z')))
    expect(result.current.getPoints()).toHaveLength(2)

    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    await waitFor(() => expect(getMetricsHistory).toHaveBeenCalledTimes(1))
  })

  it('unsubscribes from the stream on unmount', async () => {
    const control = setup()
    const { result, unmount } = renderHook(() => useLiveMetrics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    unmount()
    expect(control.wasUnsubscribed()).toBe(true)
  })
})
