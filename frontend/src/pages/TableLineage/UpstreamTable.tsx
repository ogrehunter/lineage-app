import styles from "./UpstreamTable.module.css"

export default function UpstreamList({ data }: Props) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Sticky Title */}
      <h3
        className={styles.title}
      >
        Upstream
      </h3>

      {!data || data.length === 0 ? (
        <div style={{ padding: "10px" }}>No upstream dependencies</div>
      ) : (
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {["#", "Schema", "Table", "Level", "Via Job"].map((col) => (
                  <th
                    key={col}
                    style={{
                      position: "sticky",
                      top: 0, // sticks under scroll container
                      background: "#f9fafb",
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      zIndex: 10,
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={`${item.schema}.${item.table}-${index}`}>
                  <td style={{ padding: "8px" }}>{index + 1}</td>
                  <td style={{ padding: "8px" }}>{item.schema}</td>
                  <td style={{ padding: "8px" }}>{item.table}</td>
                  <td style={{ padding: "8px" }}>{item.level}</td>
                  <td style={{ padding: "8px" }}>{item.via}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
