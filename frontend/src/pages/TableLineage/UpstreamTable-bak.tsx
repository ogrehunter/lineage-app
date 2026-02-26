interface UpstreamItem {
  schema: string
  table: string
  level: number
  via: string
}

interface Props {
  data: UpstreamItem[]
}

export default function UpstreamList({ data }: Props) {

  if (!data || data.length == 0) {
    return (
      <div>
        <h3>Upstream</h3>
        <p>No upstream dependencies</p>
      </div>
    )
  }

  return (
    <div>
      <h3>Upstream</h3>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Schema</th>
            <th>Table</th>
            <th>Level</th>
            <th>Via Job</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={`${item.schema}.${item.table}-${index}`}>
              <td>{index + 1}</td>
              <td>{item.schema}</td>
              <td>{item.table}</td>
              <td>{item.level}</td>
              <td>{item.via}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
