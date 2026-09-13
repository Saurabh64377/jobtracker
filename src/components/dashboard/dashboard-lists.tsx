import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_COLOR,
  APPLICATION_STATUS_LABEL,
} from "@/lib/constants/application-status";
import type { ApplicationStatus, ActivityType, Priority } from "@prisma/client";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
      <Inbox className="size-5" />
      {label}
    </div>
  );
}

export function RecentApplicationsCard({
  applications,
}: {
  applications: {
    id: string;
    jobTitle: string;
    currentStatus: ApplicationStatus;
    createdAt: Date;
    companyNameRaw: string | null;
    company: { name: string } | null;
  }[];
}) {
  if (applications.length === 0) return <EmptyState label="No applications yet. Add your first one!" />;

  return (
    <ul className="divide-y">
      {applications.map((app) => (
        <li key={app.id}>
          <Link
            href={`/applications/${app.id}`}
            className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:bg-muted/50 -mx-2 px-2 rounded-md"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{app.jobTitle}</p>
              <p className="truncate text-xs text-muted-foreground">
                {app.company?.name ?? app.companyNameRaw ?? "Unknown company"}
              </p>
            </div>
            <Badge className={APPLICATION_STATUS_COLOR[app.currentStatus]} variant="secondary">
              {APPLICATION_STATUS_LABEL[app.currentStatus]}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function UpcomingInterviewsCard({
  interviews,
}: {
  interviews: {
    id: string;
    round: string;
    scheduledDate: Date;
    application: { jobTitle: string; companyNameRaw: string | null; company: { name: string } | null };
  }[];
}) {
  if (interviews.length === 0) return <EmptyState label="No upcoming interviews scheduled." />;

  return (
    <ul className="space-y-1">
      {interviews.map((interview) => (
        <li key={interview.id}>
          <Link
            href={`/interviews/${interview.id}`}
            className="flex items-center gap-3 rounded-md -mx-2 px-2 py-2.5 text-sm transition-colors hover:bg-muted/50"
          >
            <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg border bg-card text-center leading-none">
              <span className="text-[10px] font-medium text-muted-foreground">
                {format(interview.scheduledDate, "MMM")}
              </span>
              <span className="text-sm font-semibold">{format(interview.scheduledDate, "d")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{interview.application.jobTitle}</p>
              <p className="truncate text-xs text-muted-foreground">
                {interview.application.company?.name ?? interview.application.companyNameRaw} ·{" "}
                {format(interview.scheduledDate, "h:mm a")}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
              {interview.round.toLowerCase().replace(/_/g, " ")}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PendingFollowUpsCard({
  followUps,
}: {
  followUps: {
    id: string;
    title: string;
    dueDate: Date;
    priority: Priority;
    application: { jobTitle: string } | null;
    company: { name: string } | null;
  }[];
}) {
  if (followUps.length === 0) return <EmptyState label="No pending follow-ups. Nice work!" />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <ul className="space-y-1">
      {followUps.map((f) => {
        const isOverdue = f.dueDate < today;
        return (
          <li key={f.id} className="flex items-center gap-3 rounded-md -mx-2 px-2 py-2.5 text-sm">
            <CalendarClock className={`size-4 shrink-0 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{f.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {f.company?.name ?? f.application?.jobTitle ?? "General"}
              </p>
            </div>
            <span className={`shrink-0 text-xs ${isOverdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
              {isOverdue ? "Overdue" : format(f.dueDate, "MMM d")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const ACTIVITY_LABEL: Partial<Record<ActivityType, string>> = {
  APPLICATION_SUBMITTED: "Application submitted",
  STATUS_CHANGED: "Status changed",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  INTERVIEW_COMPLETED: "Interview completed",
  OFFER_RECEIVED: "Offer received",
  REJECTED: "Rejected",
  FOLLOW_UP: "Follow-up",
  NOTE_ADDED: "Note added",
};

export function RecentActivityCard({
  activities,
}: {
  activities: {
    id: string;
    type: ActivityType;
    title: string;
    occurredAt: Date;
    application: { jobTitle: string } | null;
  }[];
}) {
  if (activities.length === 0) return <EmptyState label="No activity yet." />;

  return (
    <ul className="space-y-4">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-3 text-sm">
          <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0">
            <p className="font-medium">{a.title || ACTIVITY_LABEL[a.type] || "Activity"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {a.application?.jobTitle ?? ""} · {format(a.occurredAt, "MMM d, h:mm a")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
