import { useEffect, useState } from "react"
import styles from "./ColumnLineagePage.module.css"

import { fetchLineage } from "../../api/lineage"

import { useSearchParams } from "react-router-dom"

import type { LineageResponse } from "../../api/lineage"

export default function ColumnLineagePage() {

  const [params] = useSearchParams()

  const etl = params.get("etl") || "dbetl_t2_t3"
  const schema = params.get("schema") || "dbigz_prod"
  const table = params.get("table") || "d_eoi_identifier"
  const level = Number(params.get("level") || 1)

  const [lineage, setLineage] = useState<LineageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!schema || !table) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchLineage(etl, schema, table, level)

        setLineage(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load lineage")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [etl, schema, table, level])

  return (
    <div className={styles.pageContainer}>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && lineage && <p>Execution dependency data loaded for {schema}.{table}.</p>}
    </div>
  )
}

