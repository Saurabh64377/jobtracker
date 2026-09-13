import "server-only";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek, format } from "date-fns";
import type { ApplicationStatus } from "@prisma/client";

const RESPONDED_STATUSES: ApplicationStatus[] = [
  "APPLICATION_VIEWED",
  "RECRUITER_CONTACTED",
  "RECRUITER_RESPONDED",
  "HR_SCHEDULED",
  "HR_COMPLETED",
  "TECHNICAL_SCHEDULED",
  "TECHNICAL_COMPLETED",
  "MANAGERIAL_ROUND",
  "FINAL_ROUND",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

const INTERVIEW_STATUSES: ApplicationStatus[] = [
  "HR_SCHEDULED",
  "HR_COMPLETED",
  "TECHNICAL_SCHEDULED",
  "TECHNICAL_COMPLETED",
  "MANAGERIAL_ROUND",
  "FINAL_ROUND",
];

export async function getDashboardStats(userId: string) {
  const where = { userId, deletedAt: null, isArchived: false };
  const now = new Date();

  const [
    totalApplications,
    applied,
    responses,
    interviewingApplications,
    offers,
    rejected,
    followUpsDue,
    upcomingInterviews,
  ] = await Promise.all([
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: "APPLIED" } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: RESPONDED_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: INTERVIEW_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: ["OFFER", "ACCEPTED"] } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: "REJECTED" } }),
    prisma.followUp.count({
      where: { userId, status: "PENDING", dueDate: { lte: endOfDay(now) } },
    }),
    prisma.interview.count({
      where: { userId, status: "SCHEDULED", scheduledDate: { gte: startOfDay(now) } },
    }),
  ]);

  return {
    totalApplications,
    applied,
    responses,
    interviews: interviewingApplications,
    offers,
    rejected,
    followUpsDue,
    upcomingInterviews,
  };
}

export async function getWeeklyApplicationChart(userId: string, weeks = 8) {
  const now = new Date();
  const since = startOfWeek(subWeeks(now, weeks - 1));

  const applications = await prisma.jobApplication.findMany({
    where: { userId, deletedAt: null, applicationDate: { gte: since } },
    select: { applicationDate: true },
  });

  const buckets: { week: string; count: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i));
    const weekEnd = endOfWeek(subWeeks(now, i));
    const count = applications.filter(
      (a) => a.applicationDate >= weekStart && a.applicationDate <= weekEnd,
    ).length;
    buckets.push({ week: format(weekStart, "MMM d"), count });
  }

  return buckets;
}

export async function getApplicationFunnel(userId: string) {
  const where = { userId, deletedAt: null };

  const [applications, responded, interviewing, finalRound, offers, accepted] = await Promise.all([
    prisma.jobApplication.count({ where: { ...where, currentStatus: { not: "WISHLIST" } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: RESPONDED_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: INTERVIEW_STATUSES } } }),
    prisma.jobApplication.count({
      where: { ...where, currentStatus: { in: ["FINAL_ROUND", "OFFER", "ACCEPTED"] } },
    }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: ["OFFER", "ACCEPTED"] } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: "ACCEPTED" } }),
  ]);

  return [
    { stage: "Applications", count: applications },
    { stage: "Responses", count: responded },
    { stage: "Interviews", count: interviewing },
    { stage: "Final Rounds", count: finalRound },
    { stage: "Offers", count: offers },
    { stage: "Accepted", count: accepted },
  ];
}

export async function getRecentApplications(userId: string, limit = 5) {
  return prisma.jobApplication.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { company: { select: { name: true } } },
  });
}

export async function getUpcomingInterviews(userId: string, limit = 5) {
  return prisma.interview.findMany({
    where: { userId, status: "SCHEDULED", scheduledDate: { gte: startOfDay(new Date()) } },
    orderBy: { scheduledDate: "asc" },
    take: limit,
    include: { application: { select: { jobTitle: true, companyNameRaw: true, company: { select: { name: true } } } } },
  });
}

export async function getPendingFollowUps(userId: string, limit = 5) {
  return prisma.followUp.findMany({
    where: { userId, status: "PENDING" },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { application: { select: { jobTitle: true } }, company: { select: { name: true } } },
  });
}

export async function getRecentActivity(userId: string, limit = 8) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
    take: limit,
    include: { application: { select: { jobTitle: true } } },
  });
}

export async function getActiveGoal(userId: string) {
  const now = new Date();
  return prisma.goal.findFirst({
    where: { userId, periodStart: { lte: now }, periodEnd: { gte: now } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGoalProgress(userId: string, periodStart: Date, periodEnd: Date) {
  const where = { userId, deletedAt: null, applicationDate: { gte: periodStart, lte: periodEnd } };

  const [applications, interviews, offers] = await Promise.all([
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: INTERVIEW_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: ["OFFER", "ACCEPTED"] } } }),
  ]);

  return { applications, interviews, offers };
}
