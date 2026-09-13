import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "default" | "primary" | "success" | "warning" | "destructive";
};

const accentClasses: Record<NonNullable<Props["accent"]>, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon: Icon, accent = "default" }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-7 items-center justify-center rounded-md", accentClasses[accent])}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
