import { useEffect, useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"

import type { CSSProperties } from "react"

import styles from "./Sidebar.module.css"

import { Icons } from "../../icons"


type SidebarProps = {
  width: number
  collapsed: boolean
  onToggle: () => void
}

type SearchValues = {
  etl: string
  schema: string
  table: string
  level: number
}

const DEFAULT_SEARCH_VALUES: Record<string, SearchValues> = {
  "/table": {
    etl: "dbetl_t2_t3",
    schema: "dbigz_prod",
    table: "f_spt_ppn_induk",
    level: 1,
  },
  "/execution_dependency": {
    etl: "dbetl_t2_t3",
    schema: "dbigz_prod",
    table: "d_eoi_identifier",
    level: 1,
  },
  "/column": {
    etl: "dbetl_t2_t3",
    schema: "dbigz_prod",
    table: "f_spt_ppn_induk",
    level: 1,
  },
}

export default function Sidebar({
  width,
  collapsed,
  onToggle
}: SidebarProps) {
  const location = useLocation()
  const [params, setParams] = useSearchParams()

  const isSearchPage = location.pathname === "/table" || location.pathname === "/execution_dependency" || location.pathname === "/column"

  const defaults = DEFAULT_SEARCH_VALUES[location.pathname] ?? DEFAULT_SEARCH_VALUES["/table"]

  const [searchValues, setSearchValues] = useState<SearchValues>({
    etl: params.get("etl") || defaults.etl,
    schema: params.get("schema") || defaults.schema,
    table: params.get("table") || defaults.table,
    level: Number(params.get("level") || defaults.level),
  })

  useEffect(() => {
    setSearchValues({
      etl: params.get("etl") || defaults.etl,
      schema: params.get("schema") || defaults.schema,
      table: params.get("table") || defaults.table,
      level: Number(params.get("level") || defaults.level),
    })
  }, [defaults.etl, defaults.level, defaults.schema, defaults.table, params])

  const sidebarStyle = {
    "--sidebar-width": `${width}px`
  } as CSSProperties

  const ToggleIcon = collapsed ? Icons.search : Icons.panelClose

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      style={sidebarStyle}
    >
      {/* Header */}
      <div className={styles.header}>
        {!collapsed && (
          <h4
            className={`${styles.title} ${collapsed ? styles.hidden : ""}`}
          >
            Search Panel
          </h4>
        )}

        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <ToggleIcon size={18} />
        </button>
      </div>
      {!collapsed && isSearchPage && (
        <form
          className={styles.searchForm}
          onSubmit={(event) => {
            event.preventDefault()
            setParams({
              etl: searchValues.etl,
              schema: searchValues.schema,
              table: searchValues.table,
              level: String(searchValues.level),
            })
          }}
        >
          <h5 className={styles.searchTitle}>Search</h5>

          <label className={styles.searchLabel}>
            ETL
            <input
              className={styles.searchInput}
              value={searchValues.etl}
              onChange={(event) => setSearchValues((current) => ({
                ...current,
                etl: event.target.value,
              }))}
            />
          </label>

          <label className={styles.searchLabel}>
            Schema
            <input
              className={styles.searchInput}
              value={searchValues.schema}
              onChange={(event) => setSearchValues((current) => ({
                ...current,
                schema: event.target.value,
              }))}
            />
          </label>

          <label className={styles.searchLabel}>
            Table
            <input
              className={styles.searchInput}
              value={searchValues.table}
              onChange={(event) => setSearchValues((current) => ({
                ...current,
                table: event.target.value,
              }))}
            />
          </label>

          <label className={styles.searchLabel}>
            Max Level
            <input
              type="number"
              className={styles.searchInput}
              min={1}
              max={10}
              value={searchValues.level}
              onChange={(event) => {
                const inputLevel = event.target.valueAsNumber

                setSearchValues((current) => ({
                  ...current,
                  level: Number.isNaN(inputLevel) ? 1 : inputLevel,
                }))
              }}
            />
          </label>

          <button className={styles.searchButton} type="submit">
            {location.pathname === "/execution_dependency" ? "Analyse" : "Show"}
          </button>
        </form>
      )}
    </aside>
  )
}
