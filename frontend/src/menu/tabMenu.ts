import type { IconName } from "../icons";

export interface MenuItem {
  label: string;
  path: string;
  end?: boolean;
  icon: IconName;
}

export const TABBED_MENU: MenuItem[] = [
  {
    label: "Table Raw Lineage",
    path: "/table",
    end: true,
    icon: "database",
  },
  {
    label: "Execution Dependency",
    path: "/execution_dependency",
    end: true,
    icon: "topology",
  },
  {
    label: "Impacted Tables",
    path: "/impacted_table",
    icon: "history",
  },
  {
    label: "Column Lineage",
    path: "/column",
    icon: "column",
  },
  /*
  {
    label: "Recently Analyzed Tables",
    path: "/recently_analyzed_tables",
    icon: "recent",
  },
  {
    label: "Quick Metrics",
    path: "/quick_metrics",
    icon: "metrics",
  },
  {
    label: "Filters",
    path: "/filters",
    icon: "filter",
  },
*/
];
