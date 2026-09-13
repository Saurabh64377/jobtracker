"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { KanbanCard, type KanbanApplication } from "@/components/applications/kanban-card";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants/application-status";
import type { ApplicationStatus } from "@prisma/client";

export function KanbanColumn({
  status,
  applications,
  onDrop,
  onStatusChange,
}: {
  status: ApplicationStatus;
  applications: KanbanApplication[];
  onDrop: (applicationId: string, status: ApplicationStatus) => void;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const id = e.dataTransfer.getData("text/application-id");
        if (id) onDrop(id, status);
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-xs font-semibold">{APPLICATION_STATUS_LABEL[status]}</span>
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
          {applications.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {applications.map((app) => (
          <div
            key={app.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/application-id", app.id);
              e.dataTransfer.effectAllowed = "move";
            }}
          >
            <KanbanCard application={app} onStatusChange={(s) => onStatusChange(app.id, s)} dragHandlers={{}} />
          </div>
        ))}
        {applications.length === 0 && (
          <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
