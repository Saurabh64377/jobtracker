"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLOR, APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from "@/lib/constants/application-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus } from "@prisma/client";

export type KanbanApplication = {
  id: string;
  jobTitle: string;
  companyNameRaw: string | null;
  company: { id: string; name: string } | null;
  currentStatus: ApplicationStatus;
  priority: string;
  workMode: string;
  city: string | null;
  applicationDate: string;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  currency: string;
};

export function KanbanCard({
  application,
  onStatusChange,
  dragHandlers,
}: {
  application: KanbanApplication;
  onStatusChange: (status: ApplicationStatus) => void;
  dragHandlers: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div
      {...dragHandlers}
      className="group cursor-grab space-y-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <Link href={`/applications/${application.id}`} className="block space-y-1.5">
        <p className="line-clamp-1 text-sm font-medium">{application.jobTitle}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="size-3" />
          {application.company?.name ?? application.companyNameRaw ?? "Unknown"}
        </p>
        {application.city && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {application.city} · {application.workMode.toLowerCase()}
          </p>
        )}
      </Link>
      <div className="flex items-center justify-between gap-2 pt-1">
        <Badge className={PRIORITY_COLOR[application.priority]} variant="secondary">
          {application.priority}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {format(new Date(application.applicationDate), "MMM d")}
        </span>
      </div>
      <Select value={application.currentStatus} onValueChange={(v) => onStatusChange(v as ApplicationStatus)}>
        <SelectTrigger size="sm" className="w-full text-xs">
          <SelectValue>{(v: ApplicationStatus) => APPLICATION_STATUS_LABEL[v] ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {APPLICATION_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {APPLICATION_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
