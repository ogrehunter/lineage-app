// frontend/src/pages/TableLineage/LineageGraph.tsx

import { useEffect } from "react"

import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
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
  type?: string
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
  direction = "LR",
}: Props) {

  const nodeTypes = {
    table: TableNode,
  }

  /* -----------------------------
     React Flow State
  ------------------------------ */

  const [flowNodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState<Edge>([])


  /* -----------------------------
     Build + Layout Graph
  ------------------------------ */

  useEffect(() => {

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

        draggable: true,
      }
    })


    /* -----------------------------
       Build Edges
    ------------------------------ */

    const initialEdges: Edge[] = edges
      .filter(
        (e) =>
          nodeIds.has(e.from) &&
          nodeIds.has(e.to)
      )
      .map((e, index) => ({
        id: `${e.from}-${e.to}-${e.type}-${index}`,
        source: e.from,
        target: e.to,
        //animated: true,
      }))


    /* -----------------------------
       Run Dagre Layout
    ------------------------------ */

    const { nodes: layoutedNodes, edges: layoutedEdges } =
      layoutElements(
        initialNodes,
        initialEdges,
        direction
      )


    /* -----------------------------
       Set ReactFlow State
    ------------------------------ */

    setNodes(layoutedNodes)
    setEdges(layoutedEdges)

  }, [nodes, edges, root.id, direction, setNodes, setEdges])


  /* -----------------------------
     Render
  ------------------------------ */

  return (
    <div className={styles.main}>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}

        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}

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
