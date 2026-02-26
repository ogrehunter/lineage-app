import { useState } from "react"
import styles from "./SearchBox.module.css"

interface Props {
  defaultEtl: string;
  defaultSchema: string;
  defaultTable: string;
  defaultLevel: number;
  onSearch: (params: {
    etl: string;
    schema: string;
    table: string;
    level: number;
  }) => void
}

export default function SearchBox({ defaultEtl, defaultSchema, defaultTable, defaultLevel, onSearch }: Props) {
  const [etl, setEtl] = useState(defaultEtl);
  const [schema, setSchema] = useState(defaultSchema);
  const [table, setTable] = useState(defaultTable);
  const [level, setLevel] = useState(defaultLevel);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSearch({ etl, schema, table, level });
    console.log("Submitting: ", { etl, schema, table, level });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>ETL</label>
        <input
          type="text"
          placeholder="ETL Schema"
          value={etl}
          onChange={(e) => setEtl(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Schema</label>
        <input
          type="text"
          placeholder="Table Schema"
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Table</label>
        <input
          type="text"
          placeholder="Table Name"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Max Level</label>
        <input
          type="number"
          min={1}
          max={10}
          placeholder="Max Level"
          value={level}
          onChange={(e) => {
            const val = e.target.valueAsNumber;
            setLevel(isNaN(val) ? 1 : val);
          }}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.label}>&nbsp;</div>
        <button type="submit" className={styles.button}>
          Show
        </button>
      </div>
    </form>
  )
}

