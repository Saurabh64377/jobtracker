"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Trash2, CheckSquare, CalendarClock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { FollowUpDialog } from "@/components/tasks/followup-dialog";
import { PRIORITY_COLOR } from "@/lib/constants/application-status";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  application: { id: string; jobTitle: string } | null;
};

type FollowUp = {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  application: { id: string; jobTitle: string } | null;
  company: { id: string; name: string } | null;
  contact: { id: string; name: string } | null;
};

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  return (await res.json()).data as Task[];
}
async function fetchFollowUps() {
  const res = await fetch("/api/followups");
  return (await res.json()).data as FollowUp[];
}

function dueBucket(dueDate: string | null) {
  if (!dueDate) return "none";
  const d = startOfDay(new Date(dueDate));
  if (isPast(d) && !isToday(d)) return "overdue";
  if (isToday(d)) return "today";
  return "upcoming";
}

export function TasksFollowUpsView() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const followUpsQuery = useQuery({ queryKey: ["followups"], queryFn: fetchFollowUps });

  async function toggleTask(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: task.status === "DONE" ? "TODO" : "DONE" }),
    });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    toast.success("Task deleted.");
  }

  async function toggleFollowUp(f: FollowUp) {
    await fetch(`/api/followups/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: f.status !== "COMPLETED" }),
    });
    queryClient.invalidateQueries({ queryKey: ["followups"] });
  }

  async function deleteFollowUp(id: string) {
    await fetch(`/api/followups/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["followups"] });
    toast.success("Follow-up deleted.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tasks & Follow-ups</h1>
        <p className="text-sm text-muted-foreground">Everything you still need to do for your job search.</p>
      </div>

      <Tabs defaultValue="followups">
        <TabsList>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="followups" className="space-y-4">
          <div className="flex justify-end">
            <FollowUpDialog onSaved={() => queryClient.invalidateQueries({ queryKey: ["followups"] })} />
          </div>
          {followUpsQuery.isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <FollowUpGroups
              followUps={followUpsQuery.data ?? []}
              onToggle={toggleFollowUp}
              onDelete={deleteFollowUp}
            />
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-end">
            <TaskDialog onSaved={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} />
          </div>
          {tasksQuery.isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <TaskGroups tasks={tasksQuery.data ?? []} onToggle={toggleTask} onDelete={deleteTask} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FollowUpGroups({
  followUps,
  onToggle,
  onDelete,
}: {
  followUps: FollowUp[];
  onToggle: (f: FollowUp) => void;
  onDelete: (id: string) => void;
}) {
  const pending = followUps.filter((f) => f.status === "PENDING");
  const completed = followUps.filter((f) => f.status === "COMPLETED");

  const overdue = pending.filter((f) => dueBucket(f.dueDate) === "overdue");
  const today = pending.filter((f) => dueBucket(f.dueDate) === "today");
  const upcoming = pending.filter((f) => dueBucket(f.dueDate) === "upcoming");

  const groups = [
    { label: "Overdue", items: overdue, emphasis: true },
    { label: "Due today", items: today },
    { label: "Upcoming", items: upcoming },
    { label: "Completed", items: completed, muted: true },
  ];

  if (followUps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
        <CalendarClock className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No follow-ups yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.label} className="space-y-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${group.emphasis ? "text-destructive" : "text-muted-foreground"}`}>
                {group.label} ({group.items.length})
              </h3>
              <div className="space-y-2">
                {group.items.map((f) => (
                  <div key={f.id} className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${group.muted ? "opacity-60" : ""}`}>
                    <Checkbox checked={f.status === "COMPLETED"} onCheckedChange={() => onToggle(f)} />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${f.status === "COMPLETED" ? "line-through" : ""}`}>{f.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {f.company?.name ?? f.application?.jobTitle ?? f.contact?.name ?? "General"} · {format(new Date(f.dueDate), "MMM d")}
                      </p>
                    </div>
                    <Badge className={PRIORITY_COLOR[f.priority]} variant="secondary">
                      {f.priority}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete(f.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
}

function TaskGroups({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const active = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
        <CheckSquare className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {[
        { label: "To do", items: active },
        { label: "Done", items: done, muted: true },
      ].map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.label} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label} ({group.items.length})
              </h3>
              <div className="space-y-2">
                {group.items.map((t) => (
                  <div key={t.id} className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${group.muted ? "opacity-60" : ""}`}>
                    <Checkbox checked={t.status === "DONE"} onCheckedChange={() => onToggle(t)} />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${t.status === "DONE" ? "line-through" : ""}`}>{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.application?.jobTitle ?? "General"}
                        {t.dueDate ? ` · Due ${format(new Date(t.dueDate), "MMM d")}` : ""}
                      </p>
                    </div>
                    <Badge className={PRIORITY_COLOR[t.priority]} variant="secondary">
                      {t.priority}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete(t.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
}
