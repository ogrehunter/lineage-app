import styles from "./DownstreamTable.module.css"

export default function DownstreamList({ data }: Props) {
  return (
    <div
      className={styles.container}>
      {/* Sticky Title */}
      <h3 className={styles.title}>
        Downstream
      </h3>

      {!data || data.length === 0 ? (
        <div className={styles.emptyState}>No downstream child</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {["#", "Schema", "Table", "Level", "Via Job"].map((col) => (
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
