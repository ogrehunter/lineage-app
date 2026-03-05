import { useEffect, useState } from "react"
import styles from "./Header.module.css"



export default function Header() {


  return (
    <header className={styles.header}>
      <h2 className={styles.title}>SQL Lineage</h2>

    </header>
  )
}
