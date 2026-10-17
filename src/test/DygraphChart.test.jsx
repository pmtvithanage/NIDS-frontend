import { Profiler, createRef } from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DygraphChart from '../components/charts/DygraphChart.jsx'
import { dygraphInstances } from './dygraphMock.js'

const LABELS = ['t', 'Alerts']
const ROWS = [
  [new Date('2026-01-01T00:00:00Z'), 1],
  [new Date('2026-01-01T00:00:01Z'), 2],
]

describe('DygraphChart', () => {
  it('creates exactly one Dygraph per mount and destroys it on unmount', () => {
    const { unmount } = render(<DygraphChart labels={LABELS} />)

    expect(dygraphInstances).toHaveLength(1)
    const instance = dygraphInstances[0]

    unmount()

    expect(dygraphInstances[0].destroy).toHaveBeenCalledTimes(1)
    expect(instance.destroy).toHaveBeenCalledTimes(1)
  })

  it('streams rows imperatively without re-rendering React', () => {
    let commits = 0
    const ref = createRef()
    render(
      <Profiler
        id="chart"
        onRender={() => {
          commits += 1
        }}
      >
        <DygraphChart ref={ref} labels={LABELS} />
      </Profiler>,
    )

    const instance = dygraphInstances[0]
    const baseline = commits

    act(() => {
      ref.current.append([[new Date('2026-01-01T00:00:02Z'), 3]])
    })
    expect(ref.current.getRows()).toHaveLength(1)

    act(() => {
      ref.current.setData(ROWS)
    })

    expect(instance.updateOptions).toHaveBeenCalledWith({ file: ROWS })
    expect(commits).toBe(baseline)
  })

  it('re-applies chart options when the theme changes', async () => {
    render(<DygraphChart labels={LABELS} colors={['--sev-critical']} />)
    const instance = dygraphInstances[0]
    instance.updateOptions.mockClear()

    document.documentElement.classList.add('dark')

    await waitFor(() => expect(instance.updateOptions).toHaveBeenCalled())

    document.documentElement.classList.remove('dark')
  })

  it('seeds a shape-matching row so an empty mount does not log a column mismatch', () => {
    render(<DygraphChart labels={LABELS} />)

    const file = dygraphInstances[0].data
    expect(file).toHaveLength(1)
    expect(file[0]).toHaveLength(LABELS.length)
  })

  it('renders an aria-labelled canvas with a visually hidden latest-values line', () => {
    const ref = createRef()
    const { container } = render(
      <DygraphChart ref={ref} labels={LABELS} ariaLabel="Custom live chart" />,
    )

    act(() => {
      ref.current.setData(ROWS)
    })

    const canvas = container.querySelector('[role="img"]')
    expect(canvas?.getAttribute('aria-label')).toBe('Custom live chart')

    const summary = container.querySelector('.sr-only')
    expect(summary?.textContent).toContain('Alerts')
    expect(summary?.textContent).toContain('2')
  })
})
