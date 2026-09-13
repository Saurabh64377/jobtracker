import type { Metadata } from "next";
import { TasksFollowUpsView } from "@/components/tasks/tasks-followups-view";

export const metadata: Metadata = { title: "Tasks & Follow-ups" };

export default function TasksPage() {
  return <TasksFollowUpsView />;
}
