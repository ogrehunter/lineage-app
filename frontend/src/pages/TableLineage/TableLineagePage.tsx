import { useEffect, useState } from "react"
import LineageGraph from "./LineageGraph"
import UpstreamList from "./UpstreamTable"
import DownstreamList from "./DownstreamTable"
import styles from "./TableLineagePage.module.css"
import { fetchLineage } from "../../api/lineage"

import { useSearchParams } from "react-router-dom"

import type { LineageResponse } from "../../api/lineage"



export default function TableLineagePage() {

  const [params] = useSearchParams()

  const etl = params.get("etl") || "dbetl_t2_t3"
  const schema = params.get("schema") || "dbigz_prod"
  const table = params.get("table") || "f_spt_ppn_induk"
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
    console.log("URL params: ", { etl, schema, table, level });
  }, [etl, schema, table, level]);

  return (
    <div className={styles.pageContainer}>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {lineage && !loading && (

        <>
          {/* Graph */}

          <div className={styles.graphContainer}>
            <LineageGraph
              root={lineage.root}
              nodes={lineage.nodes}
              edges={lineage.edges}
            />
          </div>

          {/* Tables */}

          <div className={styles.tablesContainer}>
            <div className={styles.tableBox}>
              <UpstreamList
                data={lineage.upstream}
              />
            </div>

            <div className={styles.tableBox}>
              <DownstreamList
                data={lineage.downstream}
              />
            </div>

          </div>
        </>
      )}

    </div>
  )
}
