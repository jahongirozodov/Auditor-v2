import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckSquare,
  FileSearch,
  FileText,
  FolderKanban,
  History,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Monitor,
  Network,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { RoleCode } from "@/lib/types/roles";

export interface NavItem {
  id: string;
  href: string;
  /** i18n key under the `nav` namespace. */
  labelKey: string;
  icon: LucideIcon;
  count?: number;
  /** Allowed roles (visibility allowlist). Omit = visible to all. */
  roles?: RoleCode[];
}

export interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

/**
 * Sidebar nav, ported from the prototype (chrome.jsx). Visibility uses an explicit
 * canonical-role allowlist that mirrors the prototype exactly — this is UI-level
 * navigation gating, distinct from action-level rbac.ts (used server-side).
 * Counts are static for now (prototype values) — derive from data in a later phase.
 */
export const NAV: NavGroup[] = [
  {
    labelKey: "groupMain",
    items: [
      { id: "dashboard", href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { id: "orgs", href: "/organizations", labelKey: "orgs", icon: Building2 },
      { id: "audits", href: "/audits", labelKey: "audits", icon: FolderKanban, count: 6 },
      { id: "tasks", href: "/tasks", labelKey: "tasks", icon: CheckSquare, count: 7 },
      { id: "assign", href: "/tasks/assign", labelKey: "assign", icon: Inbox },
      { id: "findings", href: "/findings", labelKey: "findings", icon: AlertTriangle, count: 34 },
    ],
  },
  {
    labelKey: "groupAnalysis",
    items: [
      { id: "config", href: "/analysis/config", labelKey: "config", icon: Server },
      { id: "scanner", href: "/analysis/scanner", labelKey: "scanner", icon: FileSearch },
      { id: "topology", href: "/analysis/topology", labelKey: "topology", icon: Network },
      { id: "traffic", href: "/analysis/traffic", labelKey: "traffic", icon: Activity },
      { id: "ai", href: "/ai", labelKey: "ai", icon: Sparkles },
      { id: "kpi", href: "/kpi", labelKey: "kpi", icon: BarChart3 },
      { id: "reports", href: "/reports", labelKey: "reports", icon: FileText },
    ],
  },
  {
    labelKey: "groupAdmin",
    items: [
      {
        id: "tokens",
        href: "/tokens",
        labelKey: "tokens",
        icon: KeyRound,
        roles: ["super", "head"],
      },
      { id: "users", href: "/users", labelKey: "users", icon: Users, roles: ["super", "head"] },
      {
        id: "permissions",
        href: "/permissions",
        labelKey: "permissions",
        icon: ShieldCheck,
        roles: ["super"],
      },
      { id: "logs", href: "/logs", labelKey: "logs", icon: History },
      { id: "agent", href: "/agent", labelKey: "agent", icon: Monitor },
      {
        id: "settings",
        href: "/settings",
        labelKey: "settings",
        icon: Settings,
        roles: ["super", "head"],
      },
    ],
  },
];

/** True if a role may see a nav item. */
export function navVisible(item: NavItem, role: RoleCode): boolean {
  return !item.roles || item.roles.includes(role);
}
