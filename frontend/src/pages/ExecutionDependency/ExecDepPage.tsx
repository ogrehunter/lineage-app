import { useEffect, useState } from "react"
import SearchBox from "./SearchBox"
import styles from "./ExecDepPage.module.css"
import { fetchLineage } from "../../api/lineage"

import { useSearchParams } from "react-router-dom"

import type { LineageResponse } from "../../api/lineage"


export default function ExecDepPage() {

  const [params, setParams] = useSearchParams()

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
    console.log("URL params: ", { etl, schema, table, level });
  }, [etl, schema, table, level]);

  return (

    <div className={styles.pageContainer}>
      <div className={styles.searchContainer}>
        <SearchBox
          defaultEtl={etl}
          defaultSchema={schema}
          defaultTable={table}
          defaultLevel={level}
          onSearch={({ etl, table, schema, level }) => {
            setParams({
              etl,
              table,
              schema,
              level: String(level),
            });
          }}
        />
      </div>
    </div>
  )
}
