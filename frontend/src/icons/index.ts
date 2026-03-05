import {
  Database,
  GitBranch,
  Columns,
  History,
  Clock,
  BarChart3,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export const Icons = {
  database: Database,
  topology: GitBranch,
  column: Columns,
  history: History,
  recent: Clock,
  metrics: BarChart3,
  filter: Filter,
  panelClose: PanelLeftClose,
  panelOpen: PanelLeftOpen,
};

export type IconName = keyof typeof Icons;
