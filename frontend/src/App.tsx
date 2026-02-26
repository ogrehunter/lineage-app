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
  return (
    <div className={styles.appLayout}>
      <Header />

      <div className={styles.bodyLayout}>
        <Sidebar />

        <main className={styles.main}>
          <Routes>
            <Route path="/table" element={<TableLineagePage />} />
            <Route path="/column" element={<ColumnLineagePage />} />
            <Route path="/execution_dependency" element={<ExecDepPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  )
}

