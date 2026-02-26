// frontend/src/pages/TableLineage/GraphUtils.tsx

import dagre from "@dagrejs/dagre"
import type { Node, Edge } from "@xyflow/react"

const DEFAULT_NODE_WIDTH = 300
const DEFAULT_NODE_HEIGHT = 70

export type LayoutDirection = "TB" | "BT" | "LR" | "RL"

export default function layoutElements(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = "TB"
) {
  const isHorizontal = direction === "LR" || direction === "RL"

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

      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",

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

