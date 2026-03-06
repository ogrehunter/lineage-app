import { useEffect, useState } from "react"
import { NavLink, Navigate, Routes, Route, useLocation } from "react-router-dom"
import Header from "./components/header/Header"
import Sidebar from "./components/sidebar/Sidebar"
import Footer from "./components/footer/Footer"
import TableLineagePage from "./pages/TableLineage/TableLineagePage"
import ColumnLineagePage from "./pages/ColumnLineage/ColumnLineagePage"
import ExecDepPage from "./pages/ExecutionDependency/ExecDepPage"
import styles from "./App.module.css"
import { SIDEBAR_MENU } from "./menu/sidebarMenu"



/* -----------------------------
   Main App Layout
------------------------------ */
export default function App() {

  const location = useLocation()

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
    <div className={styles.appLayout}>
      <div className={styles.bodyLayout}>
        <Sidebar
          width={sidebarWidth}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />

        <section className={styles.contentLayout}>
          <Header />

          <main className={styles.main}>
            <nav className={styles.tabs} aria-label="Main navigation tabs">
              {SIDEBAR_MENU.map((item) => (
                <NavLink
                  key={item.path}
                  to={{
                    pathname: item.path,
                    search: location.search,
                  }}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive ? styles.activeTab : styles.tab
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.mainContent}>
              <Routes>
                <Route path="/" element={<Navigate to="/table" replace />} />
                <Route path="/table" element={<TableLineagePage />} />
                <Route path="/column" element={<ColumnLineagePage />} />
                <Route path="/execution_dependency" element={<ExecDepPage />} />
                <Route path="*" element={<Navigate to="/table" replace />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </section>
      </div>
    </div>
  )
}
