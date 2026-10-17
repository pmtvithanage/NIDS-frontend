import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OverviewKpis from '../components/overview/OverviewKpis.jsx'
import { useSummary } from '../hooks/useStats.js'
import { useSensors } from '../hooks/useSensors.js'
import {
  CRITICAL_LOW_EVIDENCE_HREF,
  CRITICAL_UNREVIEWED_HREF,
} from '../utils/overview.js'

vi.mock('../hooks/useStats.js', () => ({ useSummary: vi.fn() }))
vi.mock('../hooks/useSensors.js', () => ({ useSensors: vi.fn() }))

const SUMMARY = {
  total_alerts: 42,
  previous_total_alerts: 40,
  critical_unreviewed: 3,
  critical_low_evidence: 2,
  mean_triage_seconds: 90,
}

function renderKpis() {
  return render(
    <MemoryRouter>
      <OverviewKpis from={null} to={null} />
    </MemoryRouter>,
  )
}

describe('OverviewKpis', () => {
  beforeEach(() => {
    useSummary.mockReturnValue({
      data: SUMMARY,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useSensors.mockReturnValue({
      data: { data: [{ health: 'healthy' }, { health: 'offline' }] },
      isLoading: false,
      isError: false,
    })
  })

  it('renders the headline counters and the period-over-period trend', () => {
    renderKpis()

    expect(screen.getByText('Alerts in range')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText('5%')).toBeDefined()
    expect(screen.getByText('Critical unreviewed')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('Critical, low evidence')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('formats the mean time to triage and the online sensor ratio', () => {
    renderKpis()

    expect(screen.getByText('1m 30s')).toBeDefined()
    expect(screen.getByText('1/2')).toBeDefined()
  })

  it('deep-links the unreviewed and low-evidence tiles to filtered alerts', () => {
    const { container } = renderKpis()

    expect(container.querySelector(`a[href="${CRITICAL_UNREVIEWED_HREF}"]`)).not.toBeNull()
    expect(screen.getByText('Critical unreviewed')).toBeDefined()
    expect(
      screen.getByText('Critical, low evidence').closest('a')?.getAttribute('href'),
    ).toBe(CRITICAL_LOW_EVIDENCE_HREF)
  })

  it('shows a placeholder when the mean triage time is unavailable', () => {
    useSummary.mockReturnValue({
      data: { ...SUMMARY, mean_triage_seconds: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    renderKpis()

    expect(screen.getByText('Mean time to triage')).toBeDefined()
  })
})
