import type { Metadata } from "next";
import { format } from "date-fns";
import { ScrollText } from "lucide-react";
import { listAuditLogs } from "@/lib/services/admin-service";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin · Audit Logs" };

const ACTION_LABEL: Record<string, string> = {
  ADMIN_LOGIN: "Admin login",
  USER_ACTIVATED: "User activated",
  USER_DEACTIVATED: "User deactivated",
  USER_ROLE_CHANGED: "Role changed",
  USER_DELETED: "User deleted",
  OTHER: "Other",
};

export default async function AdminAuditLogsPage() {
  const { items } = await listAuditLogs();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-sm text-muted-foreground">Every important administrative action, in order.</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <ScrollText className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No admin actions recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3.5 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ACTION_LABEL[log.action] ?? log.action}</Badge>
                  <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "MMM d, yyyy · h:mm a")}</span>
                </div>
                <p className="mt-1.5 text-muted-foreground">
                  {log.actor.name ?? log.actor.email}
                  {log.targetEmail ? ` → ${log.targetEmail}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
