import { useState } from "react"
import { NavLink } from "react-router-dom"

import styles from "./Sidebar.module.css"

import { Icons } from "../../icons"
import { SIDEBAR_MENU } from "../../menu/sidebarMenu"

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar") === "collapsed"
  })

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)

    localStorage.setItem(
      "sidebar",
      next ? "collapsed" : "open"
    )
  }

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""
        }`}
    >
      {/* Header */}
      <div className={styles.header}>
        {!collapsed && (
          <h4
            className={`${styles.title} ${collapsed ? styles.hidden : ""}`}
          >
            Navigation
          </h4>
        )}

        <button
          className={styles.toggleBtn}
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Menu */}
      <nav className={styles.nav}>
        {SIDEBAR_MENU.map((item) => {
          const Icon = Icons[item.icon]

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? styles.activeLink
                  : styles.link
              }
              title={
                collapsed ? item.label : undefined
              }
            >
              <div className={styles.navContent}>
                <Icon size={18} />

                {!collapsed && (
                  <span className={styles.label}>
                    {item.label}
                  </span>
                )}
              </div>
            </NavLink>
          )
        })}
      </nav>
    </aside >
  )
}

