import type { Metadata } from "next";
import { requireAdmin } from "@/lib/api/guards";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage accounts on the platform.</p>
      </div>
      <UsersTable currentUserId={admin.id} />
    </div>
  );
}
