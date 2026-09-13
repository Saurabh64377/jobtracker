import "server-only";
import { prisma } from "@/lib/db";

export type CalendarEvent = {
  id: string;
  type: "interview" | "followup" | "task" | "deadline";
  title: string;
  subtitle?: string;
  date: Date;
  href: string;
};

export async function getCalendarEvents(userId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
  const [interviews, followUps, tasks, deadlines] = await Promise.all([
    prisma.interview.findMany({
      where: { userId, scheduledDate: { gte: start, lte: end } },
      include: { application: { select: { jobTitle: true, companyNameRaw: true, company: { select: { name: true } } } } },
    }),
    prisma.followUp.findMany({
      where: { userId, dueDate: { gte: start, lte: end }, status: "PENDING" },
    }),
    prisma.task.findMany({
      where: { userId, dueDate: { gte: start, lte: end }, status: { not: "DONE" } },
    }),
    prisma.jobApplication.findMany({
      where: { userId, deletedAt: null, applicationDeadline: { gte: start, lte: end } },
      select: { id: true, jobTitle: true, applicationDeadline: true },
    }),
  ]);

  const events: CalendarEvent[] = [];

  for (const i of interviews) {
    events.push({
      id: `interview-${i.id}`,
      type: "interview",
      title: `${i.round.replace(/_/g, " ")} · ${i.application.company?.name ?? i.application.companyNameRaw ?? i.application.jobTitle}`,
      subtitle: i.startTime ?? undefined,
      date: i.scheduledDate,
      href: `/interviews/${i.id}`,
    });
  }

  for (const f of followUps) {
    events.push({
      id: `followup-${f.id}`,
      type: "followup",
      title: f.title,
      date: f.dueDate,
      href: "/tasks",
    });
  }

  for (const t of tasks) {
    if (!t.dueDate) continue;
    events.push({
      id: `task-${t.id}`,
      type: "task",
      title: t.title,
      date: t.dueDate,
      href: "/tasks",
    });
  }

  for (const d of deadlines) {
    if (!d.applicationDeadline) continue;
    events.push({
      id: `deadline-${d.id}`,
      type: "deadline",
      title: `Deadline: ${d.jobTitle}`,
      date: d.applicationDeadline,
      href: `/applications/${d.id}`,
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
