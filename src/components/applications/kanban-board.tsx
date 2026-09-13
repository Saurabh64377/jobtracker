"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KanbanColumn } from "@/components/applications/kanban-column";
import { APPLICATION_STATUSES } from "@/lib/constants/application-status";
import type { KanbanApplication } from "@/components/applications/kanban-card";
import type { ApplicationStatus } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchApplications(params: URLSearchParams) {
  const res = await fetch(`/api/applications?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Failed to load applications");
  return json.data as { items: KanbanApplication[]; total: number };
}

export function KanbanBoard({ search }: { search?: string }) {
  const queryClient = useQueryClient();
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    return p;
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["applications", "kanban", search],
    queryFn: () => fetchApplications(params),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message ?? "Failed to update status");
      }
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["applications", "kanban", search] });
      const previous = queryClient.getQueryData<{ items: KanbanApplication[]; total: number }>([
        "applications",
        "kanban",
        search,
      ]);
      queryClient.setQueryData(["applications", "kanban", search], (old: typeof previous) =>
        old
          ? {
              ...old,
              items: old.items.map((a) => (a.id === id ? { ...a, currentStatus: status } : a)),
            }
          : old,
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["applications", "kanban", search], context.previous);
      }
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  function handleStatusChange(id: string, status: ApplicationStatus) {
    statusMutation.mutate({ id, status });
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {APPLICATION_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          applications={items.filter((a) => a.currentStatus === status)}
          onDrop={handleStatusChange}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
