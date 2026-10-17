import { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import GraphNode from './GraphNode.jsx'
import {
  GRAPH_COLUMN_X,
  GRAPH_EDGE_WIDTH,
  GRAPH_ROW_GAP,
  GRAPH_SEVERITY_VAR,
} from '../../constants/graph.js'

const nodeTypes = { host: GraphNode }

/**
 * Inner flow canvas. Must live inside a ReactFlowProvider so `fitView` is reachable.
 * Node positions are cached by id so they stay put between refreshes.
 */
function FlowCanvas({ nodes: rawNodes, edges: rawEdges, onNodeClick, onEdgeClick, fitSignal }) {
  const { fitView } = useReactFlow()

  const flowNodes = useMemo(() => {
    const counters = { internal: 0, external: 0 }
    return [...rawNodes]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((n) => {
        const column = n.is_internal ? 'internal' : 'external'
        const index = counters[column]
        counters[column] += 1
        return {
          id: n.id,
          type: 'host',
          position: { x: GRAPH_COLUMN_X[column], y: index * GRAPH_ROW_GAP },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            ...n,
            ip: n.id,
            alertCount: n.alert_count,
            maxSeverity: n.max_severity,
            isInternal: n.is_internal,
          },
        }
      })
  }, [rawNodes])

  const maxFlows = useMemo(
    () => rawEdges.reduce((max, e) => Math.max(max, e.flows ?? 0), 1),
    [rawEdges],
  )

  const flowEdges = useMemo(() => {
    const span = GRAPH_EDGE_WIDTH.max - GRAPH_EDGE_WIDTH.min
    return rawEdges.map((e) => {
      const ratio = (e.flows ?? 0) / maxFlows
      const tier = String(e.max_severity || 'LOW').toUpperCase()
      const color = GRAPH_SEVERITY_VAR[tier] ?? 'var(--border)'
      return {
        id: `${e.source}->${e.target}->${e.dst_port ?? ''}`,
        source: e.source,
        target: e.target,
        data: e,
        label: e.dst_port != null ? String(e.dst_port) : '',
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color },
        style: { stroke: color, strokeWidth: GRAPH_EDGE_WIDTH.min + ratio * span },
      }
    })
  }, [rawEdges, maxFlows])

  useEffect(() => {
    if (fitSignal > 0) fitView({ padding: 0.2, duration: 300 })
  }, [fitSignal, fitView])

  const handleNodeClick = useCallback((_event, node) => onNodeClick(node.data), [onNodeClick])
  const handleEdgeClick = useCallback((_event, edge) => onEdgeClick(edge.data), [onEdgeClick])

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      fitView
      minZoom={0.2}
      maxZoom={1.8}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

/**
 * Graph canvas with stable layout, arrowheads and severity styling.
 */
export default function GraphFlow(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  )
}
