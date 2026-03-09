// frontend/src/pages/TableLineage/GraphUtils.tsx

import dagre from "@dagrejs/dagre"
import { Position, type Node, type Edge } from "@xyflow/react"

const DEFAULT_NODE_WIDTH = 300
const DEFAULT_NODE_HEIGHT = 70
const LAYER_GAP = 360
const ROW_GAP = 120

export type LayoutDirection = "TB" | "BT" | "LR" | "RL"

function layoutByRunLevel(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection,
  getLayer: (node: Node) => number
) {
  const isRightToLeft = direction === "RL"

  const layerMap = new Map<number, Node[]>()

  nodes.forEach((node) => {
    const layer = getLayer(node)
    const safeLayer = Number.isFinite(layer) ? layer : 0
    const list = layerMap.get(safeLayer) ?? []
    list.push(node)
    layerMap.set(safeLayer, list)
  })

  const sortedLayers = Array.from(layerMap.keys()).sort((a, b) => a - b)
  const layerOrder = new Map(sortedLayers.map((layer, index) => [layer, index]))

  const layoutedNodes: Node[] = nodes.map((node) => {
    const width = node.width ?? DEFAULT_NODE_WIDTH
    const height = node.height ?? DEFAULT_NODE_HEIGHT

    const layer = getLayer(node)
    const layerIndex = layerOrder.get(layer) ?? 0
    const rowIndex = (layerMap.get(layer) ?? []).findIndex((n) => n.id === node.id)

    const x = isRightToLeft
      ? -(layerIndex * LAYER_GAP)
      : layerIndex * LAYER_GAP

    return {
      ...node,
      targetPosition: isRightToLeft ? Position.Right : Position.Left,
      sourcePosition: isRightToLeft ? Position.Left : Position.Right,
      position: {
        x,
        y: rowIndex * ROW_GAP,
      },
      style: {
        ...(node.style ?? {}),
        width,
        height,
      },
    }
  })

  return {
    nodes: layoutedNodes,
    edges: edges.map((e) => ({ ...e })),
  }
}


export default function layoutElements(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = "TB",
  getLayer?: (node: Node) => number
) {
  const isHorizontal = direction === "LR" || direction === "RL"

  if (isHorizontal && getLayer) {
    return layoutByRunLevel(nodes, edges, direction, getLayer)
  }

  const dagreGraph = new dagre.graphlib.Graph()

  dagreGraph.setDefaultEdgeLabel(() => ({}))

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 10,
    ranksep: 40,
    marginx: 20,
    marginy: 20,
  })

  /* -----------------------------
     Register Nodes
  ------------------------------ */

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    })
  })

  /* -----------------------------
     Register Edges
  ------------------------------ */

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  /* -----------------------------
     Run Layout
  ------------------------------ */

  dagre.layout(dagreGraph)

  /* -----------------------------
     Apply Positions
  ------------------------------ */

  const layoutedNodes: Node[] = nodes.map((node) => {
    const pos = dagreGraph.node(node.id)

    // Safety fallback
    if (!pos) return node

    const width = node.width ?? DEFAULT_NODE_WIDTH
    const height = node.height ?? DEFAULT_NODE_HEIGHT

    return {
      ...node,

      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,

      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    }
  })

  const layoutedEdges: Edge[] = edges.map((e) => ({ ...e }))

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  }
}

