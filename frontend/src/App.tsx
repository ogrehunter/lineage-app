import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import { Routes, Route } from "react-router-dom"
import Header from "./components/header/Header"
import Sidebar from "./components/sidebar/Sidebar"
import Footer from "./components/footer/Footer"
import TableLineagePage from "./pages/TableLineage/TableLineagePage"
import ColumnLineagePage from "./pages/ColumnLineage/ColumnLineagePage"
import ExecDepPage from "./pages/ExecutionDependency/ExecDepPage"
import styles from "./App.module.css"



/* -----------------------------
   Main App Layout
------------------------------ */
export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebar") === "collapsed"
  })

  const sidebarWidth = sidebarCollapsed ? 56 : 240

  useEffect(() => {
    localStorage.setItem(
      "sidebar",
      sidebarCollapsed ? "collapsed" : "open"
    )
  }, [sidebarCollapsed])

  return (
    <div className={styles.appLayout}
    >
      <div className={styles.bodyLayout}>
        <Sidebar
          width={sidebarWidth}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />

        <section className={styles.contentLayout}>
          <Header />

          <main className={styles.main}>
            <Routes>
              <Route path="/table" element={<TableLineagePage />} />
              <Route path="/column" element={<ColumnLineagePage />} />
              <Route path="/execution_dependency" element={<ExecDepPage />} />
            </Routes>
          </main>
          <Footer />
        </section>
      </div>
    </div>
  )
}

