"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, MoreVertical, ShieldCheck, ShieldOff, Trash2, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: { applications: number };
};

async function fetchUsers(search: string, role: string, status: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role !== "all") params.set("role", role);
  if (status !== "all") params.set("status", status);
  const res = await fetch(`/api/admin/users?${params.toString()}`);
  const json = await res.json();
  return json.data as { items: AdminUser[]; total: number };
}

export function UsersTable({ currentUserId }: { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, status],
    queryFn: () => fetchUsers(search, role, status),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  async function toggleActive(user: AdminUser) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json?.error?.message ?? "Could not update user.");
      return;
    }
    toast.success(user.isActive ? "User deactivated." : "User activated.");
    invalidate();
  }

  async function changeRole(user: AdminUser, newRole: "USER" | "ADMIN") {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json?.error?.message ?? "Could not update role.");
      return;
    }
    toast.success(`Role changed to ${newRole}.`);
    invalidate();
  }

  async function deleteUser(user: AdminUser) {
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json?.error?.message ?? "Could not delete user.");
      return;
    }
    toast.success("User deleted.");
    invalidate();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-64 pl-8" />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v ?? "all")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">{user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "secondary" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user._count.applications}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy") : "Never"}
                  </TableCell>
                  <TableCell>
                    {user.id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                          <MoreVertical className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleActive(user)}>
                            {user.isActive ? (
                              <>
                                <ShieldOff className="size-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="size-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeRole(user, user.role === "ADMIN" ? "USER" : "ADMIN")}>
                            <UserCog className="size-4" />
                            Make {user.role === "ADMIN" ? "User" : "Admin"}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="size-4" /> Delete account
                                </DropdownMenuItem>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {user.email}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently deletes the account and all of its data. This can&apos;t be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(user)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(data?.items ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
