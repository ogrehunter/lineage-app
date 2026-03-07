import styles from "./UpstreamTable.module.css"
import type { UpstreamDownstreamItem } from "../../api/lineage"

interface Props {
  data: UpstreamDownstreamItem[]
}

export default function UpstreamList({ data }: Props) {
  return (
    <div
      className={styles.container}>
      {/* Sticky Title */}
      <h3 className={styles.title}>Upstream</h3>

      {!data || data.length === 0 ? (
        <div className={styles.emptyState}>No upstream dependencies</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table
            className={styles.table}>
            <thead>
              <tr>
                {["#", "Schema", "Table", "Hop", "Run Level", "Via Job"].map((col) => (
                  <th className={styles.headerCell}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={`${item.schema}.${item.table}-${index}`}>
                  <td className={styles.bodyCell}>{index + 1}</td>
                  <td className={styles.bodyCell}>{item.schema}</td>
                  <td className={styles.bodyCell}>{item.table}</td>
                  <td className={styles.bodyCell}>{item.level}</td>
                  <td className={styles.bodyCell}>{item.run_level}</td>
                  <td className={styles.bodyCell}>{item.via}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
