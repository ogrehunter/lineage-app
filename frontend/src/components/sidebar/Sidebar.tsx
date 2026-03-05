import { NavLink } from "react-router-dom"

import type { CSSProperties } from "react"

import styles from "./Sidebar.module.css"

import { Icons } from "../../icons"
import { SIDEBAR_MENU } from "../../menu/sidebarMenu"


type SidebarProps = {
  width: number
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({
  width,
  collapsed,
  onToggle
}: SidebarProps) {
  const sidebarStyle = {
    "--sidebar-width": `${width}px`
  } as CSSProperties;

  const ToggleIcon = collapsed ? Icons.panelOpen : Icons.panelClose;

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      style={sidebarStyle}
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
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <ToggleIcon size={18} />
        </button>
      </div>

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
    </aside>
  )
}

