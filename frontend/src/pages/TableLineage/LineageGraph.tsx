// frontend/src/pages/TableLineage/LineageGraph.tsx
import { useMemo } from "react"

import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import styles from "./LineageGraph.module.css"

import layoutElements, {
  type LayoutDirection,
} from "./GraphUtils"

import TableNode from "./TableNode"


/* -----------------------------
   Types
------------------------------ */

interface LineageNode {
  id: string
  name?: string
  type: string
}

interface LineageEdge {
  from: string
  to: string
  type: string
}

interface Props {
  root: {
    id: string
    type: string
  }

  nodes: LineageNode[]
  edges: LineageEdge[]

  direction?: LayoutDirection
}


/* -----------------------------
   Component
------------------------------ */

export default function LineageGraph({
  root,
  nodes,
  edges,
  direction = "TB",
}: Props) {


  /* -----------------------------
     Build + Layout Graph
  ------------------------------ */

  const nodeTypes = {
    table: TableNode,
  }

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {

    /* -----------------------------
       Validate Nodes
    ------------------------------ */

    const nodeIds = new Set(nodes.map((n) => n.id))


    /* -----------------------------
       Build Nodes
    ------------------------------ */

    const initialNodes: Node[] = nodes.map((n) => {
      const [schema, table] = (n.name ?? n.id).split(".")

      return {
        id: n.id,
        type: "table",

        data: {
          schema: schema ?? "",
          table: table ?? n.id,
          isRoot: n.id === root.id,
          direction,
        },

        position: { x: 0, y: 0 },

        className:
          n.id === root.id
            ? styles.rootNode
            : undefined,
      }
    })


    /* -----------------------------
       Build Edges (Safe)
    ------------------------------ */

    const initialEdges: Edge[] = edges

      // Remove invalid edges
      .filter(
        (e) =>
          nodeIds.has(e.from) &&
          nodeIds.has(e.to)
      )

      // Build edges
      .map((e) => ({
        id: `${e.from}-${e.to}-${e.type}`,

        source: e.from,
        target: e.to,

        label: e.type,
      }))


    /* -----------------------------
       Layout
    ------------------------------ */

    return layoutElements(
      initialNodes,
      initialEdges,
      direction
    )

  }, [nodes, edges, root.id, direction])


  /* -----------------------------
     Render
  ------------------------------ */

  return (
    <div className={styles.main}>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        nodesDraggable
        panOnDrag

        fitView
        fitViewOptions={{ padding: 0.1 }}

        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
      </ReactFlow>

    </div>
  )
}

