import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationsToolbar } from "@/components/applications/applications-toolbar";
import { KanbanBoard } from "@/components/applications/kanban-board";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  return (
    <div className="space-y-6">
      <Suspense>
        <ApplicationsToolbar />
        <KanbanBoard search={search} />
      </Suspense>
    </div>
  );
}
