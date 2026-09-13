import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KanbanSquare,
  Users2,
  Building2,
  CalendarDays,
  CheckSquare,
  LineChart,
  FileText,
  Settings,
  ShieldCheck,
  ScrollText,
  BarChart3,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
};

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "D" },
  { label: "Applications", href: "/applications", icon: KanbanSquare },
  { label: "Interviews", href: "/interviews", icon: Users2 },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Contacts", href: "/contacts", icon: Users2 },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Resumes", href: "/resumes", icon: FileText },
];

export const bottomNav: NavItem[] = [{ label: "Settings", href: "/settings", icon: Settings }];

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: ShieldCheck },
  { label: "Analytics", href: "/admin/analytics", icon: LineChart },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
];
