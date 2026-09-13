"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, isFuture } from "date-fns";
import { CalendarDays, Plus, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Interview = {
  id: string;
  round: string;
  status: string;
  scheduledDate: string;
  startTime: string | null;
  location: string | null;
  meetingLink: string | null;
  application: { jobTitle: string; companyNameRaw: string | null; company: { name: string } | null };
};

async function fetchInterviews() {
  const res = await fetch("/api/interviews");
  const json = await res.json();
  return json.data as Interview[];
}

function InterviewRow({ interview }: { interview: Interview }) {
  return (
    <Link
      href={`/interviews/${interview.id}`}
      className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted/40 text-center leading-none">
        <span className="text-[10px] font-medium text-muted-foreground">{format(new Date(interview.scheduledDate), "MMM")}</span>
        <span className="text-sm font-semibold">{format(new Date(interview.scheduledDate), "d")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {interview.application.jobTitle} · {interview.application.company?.name ?? interview.application.companyNameRaw}
        </p>
        <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
          {interview.startTime && <span>{interview.startTime}</span>}
          {interview.meetingLink && (
            <span className="flex items-center gap-1">
              <Video className="size-3" /> Online
            </span>
          )}
          {interview.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {interview.location}
            </span>
          )}
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
        {interview.round.toLowerCase().replace(/_/g, " ")}
      </Badge>
      <Badge variant="secondary" className="shrink-0 text-[10px]">
        {interview.status.replace(/_/g, " ")}
      </Badge>
    </Link>
  );
}

export function InterviewList() {
  const { data, isLoading } = useQuery({ queryKey: ["interviews"], queryFn: fetchInterviews });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = data ?? [];
  const upcoming = items
    .filter((i) => isFuture(new Date(i.scheduledDate)) && i.status === "SCHEDULED")
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  const past = items.filter((i) => !upcoming.includes(i));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Interviews</h1>
          <p className="text-sm text-muted-foreground">Every round, scheduled from your applications.</p>
        </div>
        <Button render={<Link href="/interviews/new"><Plus className="size-4" /> Schedule interview</Link>} />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center">
            <CalendarDays className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No upcoming interviews.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((i) => (
              <InterviewRow key={i.id} interview={i} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Past</h2>
        {past.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No past interviews yet.</p>
        ) : (
          <div className="space-y-2">
            {past.map((i) => (
              <InterviewRow key={i.id} interview={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
