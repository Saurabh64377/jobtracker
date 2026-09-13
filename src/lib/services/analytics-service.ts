import "server-only";
import { prisma } from "@/lib/db";
import { startOfWeek, startOfMonth, startOfYear } from "date-fns";
import type { ApplicationStatus, JobSource } from "@prisma/client";

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

const OFFER_STATUSES: ApplicationStatus[] = ["OFFER", "ACCEPTED"];

export async function getApplicationCounts(userId: string) {
  const now = new Date();
  const where = { userId, deletedAt: null };

  const [total, thisWeek, thisMonth, thisYear] = await Promise.all([
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.count({ where: { ...where, applicationDate: { gte: startOfWeek(now) } } }),
    prisma.jobApplication.count({ where: { ...where, applicationDate: { gte: startOfMonth(now) } } }),
    prisma.jobApplication.count({ where: { ...where, applicationDate: { gte: startOfYear(now) } } }),
  ]);

  return { total, thisWeek, thisMonth, thisYear };
}

export async function getConversionRates(userId: string) {
  const where = { userId, deletedAt: null };

  const [applications, responses, interviews, offers] = await Promise.all([
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: RESPONDED_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: INTERVIEW_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: OFFER_STATUSES } } }),
  ]);

  const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);

  return {
    applicationToResponse: pct(responses, applications),
    responseToInterview: pct(interviews, responses),
    interviewToOffer: pct(offers, interviews),
    applicationToOffer: pct(offers, applications),
  };
}

const SOURCES: JobSource[] = [
  "LINKEDIN",
  "NAUKRI",
  "INDEED",
  "COMPANY_WEBSITE",
  "REFERRAL",
  "RECRUITER",
  "WHATSAPP",
  "INSTAGRAM",
  "EMAIL",
  "OTHER",
];

export async function getSourceBreakdown(userId: string) {
  const where = { userId, deletedAt: null };

  const results = await Promise.all(
    SOURCES.map(async (source) => {
      const sourceWhere = { ...where, jobSource: source };
      const [applications, responses, interviews, offers] = await Promise.all([
        prisma.jobApplication.count({ where: sourceWhere }),
        prisma.jobApplication.count({ where: { ...sourceWhere, currentStatus: { in: RESPONDED_STATUSES } } }),
        prisma.jobApplication.count({ where: { ...sourceWhere, currentStatus: { in: INTERVIEW_STATUSES } } }),
        prisma.jobApplication.count({ where: { ...sourceWhere, currentStatus: { in: OFFER_STATUSES } } }),
      ]);
      return { source, applications, responses, interviews, offers };
    }),
  );

  return results.filter((r) => r.applications > 0).sort((a, b) => b.applications - a.applications);
}

export async function getSalaryStats(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId, deletedAt: null },
    select: {
      expectedSalaryMin: true,
      expectedSalaryMax: true,
      offeredSalary: true,
      company: { select: { name: true } },
      companyNameRaw: true,
    },
  });

  const expectedValues = applications
    .flatMap((a) => [a.expectedSalaryMin, a.expectedSalaryMax])
    .filter((v): v is number => v != null);
  const offeredValues = applications.map((a) => a.offeredSalary).filter((v): v is number => v != null);

  const avg = (arr: number[]) => (arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0);

  const byCompany = applications
    .filter((a) => a.offeredSalary != null)
    .map((a) => ({ company: a.company?.name ?? a.companyNameRaw ?? "Unknown", offered: a.offeredSalary! }))
    .sort((a, b) => b.offered - a.offered);

  return {
    avgExpected: avg(expectedValues),
    avgOffered: avg(offeredValues),
    highestOffer: offeredValues.length > 0 ? Math.max(...offeredValues) : 0,
    byCompany,
  };
}

export async function getAnalyticsFunnel(userId: string) {
  const where = { userId, deletedAt: null };

  const [applications, responded, interviewing, finalRound, offers, accepted] = await Promise.all([
    prisma.jobApplication.count({ where: { ...where, currentStatus: { not: "WISHLIST" } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: RESPONDED_STATUSES } } }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: INTERVIEW_STATUSES } } }),
    prisma.jobApplication.count({
      where: { ...where, currentStatus: { in: ["FINAL_ROUND", "OFFER", "ACCEPTED"] } },
    }),
    prisma.jobApplication.count({ where: { ...where, currentStatus: { in: OFFER_STATUSES } } }),
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

export async function getRoleAndLocationBreakdown(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId, deletedAt: null },
    select: { jobTitle: true, city: true, workMode: true },
  });

  const countBy = <T extends string>(items: T[]) => {
    const map = new Map<T, number>();
    for (const item of items) {
      if (!item) continue;
      map.set(item, (map.get(item) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  };

  return {
    roles: countBy(applications.map((a) => a.jobTitle)).slice(0, 8),
    locations: countBy(applications.map((a) => a.city).filter((c): c is string => !!c)).slice(0, 8),
    workModes: countBy(applications.map((a) => a.workMode)),
  };
}
