import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CommunicationGraph from '../components/overview/CommunicationGraph.jsx'
import { useCommunicationGraph } from '../hooks/useStats.js'
import { useHost } from '../hooks/useHosts.js'

vi.mock('../hooks/useStats.js', () => ({ useCommunicationGraph: vi.fn() }))
vi.mock('../hooks/useHosts.js', () => ({ useHost: vi.fn() }))

const NODES = [
  { id: '10.0.0.5', is_internal: true, country: 'LK', alert_count: 9, max_severity: 'HIGH' },
  { id: '8.8.8.8', is_internal: false, country: 'US', alert_count: 4, max_severity: 'MEDIUM' },
]

const EDGES = [
  { source: '10.0.0.5', target: '8.8.8.8', dst_port: 443, flows: 30, alerts: 9, max_severity: 'HIGH' },
]

function renderGraph() {
  return render(
    <MemoryRouter>
      <CommunicationGraph />
    </MemoryRouter>,
  )
}

describe('CommunicationGraph', () => {
  beforeEach(() => {
    useCommunicationGraph.mockReturnValue({
      data: { nodes: NODES, edges: EDGES, generated_at: new Date().toISOString(), truncated: false },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    useHost.mockReturnValue({ data: null, isLoading: false })
  })

  it('renders the card and the flow counters without crashing', () => {
    renderGraph()

    expect(screen.getByText('Who is talking to whom')).toBeDefined()
    expect(screen.getByText('2 hosts · 1 flows')).toBeDefined()
  })

  it('opens the host side panel when a node is clicked', () => {
    renderGraph()

    fireEvent.click(screen.getByText('10.0.0.5'))
    expect(screen.getByLabelText('Host summary for 10.0.0.5')).toBeDefined()
    expect(screen.getByText('Open host page')).toBeDefined()
  })

  it('switches between the graph and the accessible table view', () => {
    renderGraph()

    fireEvent.click(screen.getByText('View as table'))
    expect(screen.getByText('443')).toBeDefined()
    expect(screen.getByText('Source')).toBeDefined()
  })
})
