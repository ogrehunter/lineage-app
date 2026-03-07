// ------------------------ Types ----------------------

export interface LineageNode {
  id: string
  schema?: string
  name?: string
  type: "table" | "job"
  etl_schema: string
  layer?: string
}

export interface LineageEdge {
  from: string
  to: string
  type: "read" | "write"
}

export interface UpstreamDownstreamItem {
  schema: string
  table: string
  level: number
  run_level: number
  via: string
}

export interface LineageResponse {
  root: {
    id: string
    type: string
  }

  nodes: LineageNode[]
  edges: LineageEdge[]

  upstream: UpstreamDownstreamItem[]
  downstream: UpstreamDownstreamItem[]
}

//-------------------------- Fetch---------------------\

export async function fetchLineage(
  etl: string,
  schema: string,
  table: string,
  level: number
): Promise<LineageResponse> {

  const res = await fetch(
    `/api/lineage/table?etl=${etl}&schema=${schema}&table=${table}&level=${level}`
  )
  if (!res.ok) {
    throw new Error("Failed to fetch lineage")
  }

  return res.json()
}
