import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react"

import styles from "./TableNode.module.css"

interface TableNodeData {
  schema: string
  table: string
  isRoot?: boolean
  direction?: "TB" | "BT" | "LR" | "RL"
}

export default function TableNode({
  data,
}: NodeProps<TableNodeData>) {
  const {
    schema,
    table,
    isRoot = false,
    direction = "TB",
  } = data

  const isHorizontal =
    direction === "LR" || direction === "RL"

  const targetPosition = isHorizontal
    ? Position.Left
    : Position.Top

  const sourcePosition = isHorizontal
    ? Position.Right
    : Position.Bottom

  return (
    <div
      className={`${styles.node} ${isRoot ? styles.root : ""
        }`}
    >
      {/* Schema Row */}
      <div className={styles.schema}>
        {schema}
      </div>

      {/* Table Row */}
      <div className={styles.table}>
        {table}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={targetPosition}
      />

      <Handle
        type="source"
        position={sourcePosition}
      />
    </div>
  )
}
