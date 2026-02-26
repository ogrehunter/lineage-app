export default function DownstreamList({ data }: Props) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // prevent outer scroll
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Sticky Title */}
      <h3
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          margin: 0,
          padding: "10px",
          zIndex: 20,
          borderBottom: "1px solid #ddd",
        }}
      >
        Downstream
      </h3>

      {!data || data.length === 0 ? (
        <div style={{ padding: "10px" }}>No downstream child</div>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: "auto", // only this scrolls
          }}
        >
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
                      top: 0,
                      background: "#f9fafb",
                      padding: "8px",
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
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
