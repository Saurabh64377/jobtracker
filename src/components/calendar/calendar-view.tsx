"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Users2, CalendarClock, CheckSquare, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CalendarEvent } from "@/lib/services/calendar-service";

const EVENT_META: Record<CalendarEvent["type"], { icon: typeof Users2; color: string }> = {
  interview: { icon: Users2, color: "bg-primary/10 text-primary" },
  followup: { icon: CalendarClock, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  task: { icon: CheckSquare, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  deadline: { icon: Flag, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

async function fetchEvents(start: Date, end: Date) {
  const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
  const res = await fetch(`/api/calendar?${params.toString()}`);
  const json = await res.json();
  return (json.data ?? []) as CalendarEvent[];
}

export function CalendarView() {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [cursor, setCursor] = useState(new Date());

  const range = useMemo(() => {
    if (view === "day") return { start: cursor, end: cursor };
    if (view === "week") return { start: startOfWeek(cursor), end: endOfWeek(cursor) };
    return { start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) };
  }, [view, cursor]);

  const { data } = useQuery({
    queryKey: ["calendar", view, range.start.toDateString(), range.end.toDateString()],
    queryFn: () => fetchEvents(range.start, range.end),
  });

  const events = data ?? [];

  function navigate(dir: 1 | -1) {
    setCursor((c) => {
      if (view === "day") return dir === 1 ? addDays(c, 1) : subDays(c, 1);
      if (view === "week") return dir === 1 ? addWeeks(c, 1) : subWeeks(c, 1);
      return dir === 1 ? addMonths(c, 1) : subMonths(c, 1);
    });
  }

  const days = eachDayOfInterval(range);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Interviews, follow-ups, tasks, and deadlines in one view.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView((v as typeof view) ?? "month")}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium">
        {view === "month" && format(cursor, "MMMM yyyy")}
        {view === "week" && `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`}
        {view === "day" && format(cursor, "EEEE, MMMM d, yyyy")}
      </p>

      {view === "day" ? (
        <DayList date={cursor} events={events.filter((e) => isSameDay(e.date, cursor))} />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <div className="grid min-w-[700px] grid-cols-7 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className={cn("grid min-w-[700px] grid-cols-7", view === "week" && "grid-rows-1")}>
            {days.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-28 border-b border-r p-1.5 last:border-r-0",
                    !isSameMonth(day, cursor) && view === "month" && "bg-muted/20 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday(day) && "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const meta = EVENT_META[event.type];
                      return (
                        <Link
                          key={event.id}
                          href={event.href}
                          className={cn("block truncate rounded px-1.5 py-0.5 text-[10px] font-medium", meta.color)}
                        >
                          {event.title}
                        </Link>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="px-1.5 text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DayList({ date, events }: { date: Date; events: CalendarEvent[] }) {
  void date;
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">Nothing scheduled for this day.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const meta = EVENT_META[event.type];
        const Icon = meta.icon;
        return (
          <Link
            key={event.id}
            href={event.href}
            className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className={cn("flex size-9 items-center justify-center rounded-lg", meta.color)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{event.title}</p>
              {event.subtitle && <p className="text-xs text-muted-foreground">{event.subtitle}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
