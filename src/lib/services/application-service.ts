import "server-only";
import { prisma } from "@/lib/db";
import type { ApplicationInput } from "@/lib/validations/application";
import type { ApplicationStatus } from "@prisma/client";
import { ServiceError } from "@/lib/services/auth-service";

const STATUS_ACTIVITY_TITLE: Partial<Record<ApplicationStatus, string>> = {
  APPLIED: "Application submitted",
  APPLICATION_VIEWED: "Application viewed by recruiter",
  RECRUITER_CONTACTED: "Recruiter contacted",
  RECRUITER_RESPONDED: "Recruiter responded",
  HR_SCHEDULED: "HR interview scheduled",
  HR_COMPLETED: "HR interview completed",
  TECHNICAL_SCHEDULED: "Technical interview scheduled",
  TECHNICAL_COMPLETED: "Technical interview completed",
  MANAGERIAL_ROUND: "Managerial round scheduled",
  FINAL_ROUND: "Final round scheduled",
  OFFER: "Offer received",
  ACCEPTED: "Offer accepted",
  REJECTED: "Application rejected",
  WITHDRAWN: "Application withdrawn",
};

async function findOrCreateCompany(userId: string, name: string) {
  const trimmed = name.trim();
  const existing = await prisma.company.findFirst({
    where: { userId, name: { equals: trimmed }, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.company.create({ data: { userId, name: trimmed } });
}

function nullifyEmpty<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === "" ? null : value;
  }
  return result;
}

export type ApplicationFilters = {
  status?: ApplicationStatus[];
  search?: string;
  priority?: string[];
  workMode?: string[];
  source?: string[];
  tagIds?: string[];
  archived?: boolean;
  page?: number;
  pageSize?: number;
};

export async function listApplications(userId: string, filters: ApplicationFilters = {}) {
  const { status, search, priority, workMode, source, tagIds, archived = false, page = 1, pageSize = 50 } = filters;

  const where = {
    userId,
    deletedAt: null,
    isArchived: archived,
    ...(status && status.length > 0 ? { currentStatus: { in: status } } : {}),
    ...(priority && priority.length > 0 ? { priority: { in: priority as never[] } } : {}),
    ...(workMode && workMode.length > 0 ? { workMode: { in: workMode as never[] } } : {}),
    ...(source && source.length > 0 ? { jobSource: { in: source as never[] } } : {}),
    ...(tagIds && tagIds.length > 0 ? { applicationTags: { some: { tagId: { in: tagIds } } } } : {}),
    ...(search
      ? {
          OR: [
            { jobTitle: { contains: search } },
            { companyNameRaw: { contains: search } },
            { company: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: { select: { id: true, name: true } },
        applicationTags: { include: { tag: true } },
      },
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getApplicationById(userId: string, id: string) {
  const application = await prisma.jobApplication.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      company: true,
      resume: { select: { id: true, name: true } },
      coverLetter: { select: { id: true, name: true } },
      referralContact: { select: { id: true, name: true } },
      applicationTags: { include: { tag: true } },
      statusHistory: { orderBy: { changedAt: "desc" } },
      activities: { orderBy: { occurredAt: "desc" } },
      communications: { orderBy: { occurredAt: "desc" }, include: { contact: true } },
      interviews: { orderBy: { scheduledDate: "desc" } },
      followUps: { orderBy: { dueDate: "asc" } },
      tasks: { orderBy: { dueDate: "asc" } },
      notes_rel: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!application) {
    throw new ServiceError("Application not found.", 404);
  }

  return application;
}

export async function createApplication(userId: string, input: ApplicationInput) {
  const company = await findOrCreateCompany(userId, input.companyName);

  const { companyName, tagIds, ...rest } = input;
  void companyName;

  const application = await prisma.jobApplication.create({
    data: {
      userId,
      companyId: company.id,
      companyNameRaw: company.name,
      ...nullifyEmpty(rest),
      applicationTags: tagIds?.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    } as never,
  });

  await prisma.$transaction([
    prisma.applicationStatusHistory.create({
      data: { applicationId: application.id, toStatus: application.currentStatus },
    }),
    prisma.activity.create({
      data: {
        userId,
        applicationId: application.id,
        type: "APPLICATION_SUBMITTED",
        title: `Added application for ${application.jobTitle} at ${company.name}`,
        occurredAt: application.applicationDate,
      },
    }),
  ]);

  return application;
}

export async function updateApplication(userId: string, id: string, input: ApplicationInput) {
  const existing = await prisma.jobApplication.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Application not found.", 404);

  const company = await findOrCreateCompany(userId, input.companyName);
  const { companyName, tagIds, ...rest } = input;
  void companyName;

  const statusChanged = existing.currentStatus !== input.currentStatus;

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      companyId: company.id,
      companyNameRaw: company.name,
      ...nullifyEmpty(rest),
      ...(tagIds
        ? {
            applicationTags: {
              deleteMany: {},
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    } as never,
  });

  if (statusChanged) {
    await recordStatusChange(userId, id, existing.currentStatus, input.currentStatus);
  }

  return updated;
}

export async function recordStatusChange(
  userId: string,
  applicationId: string,
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus,
  note?: string,
) {
  const activityTitle = STATUS_ACTIVITY_TITLE[toStatus] ?? `Status changed to ${toStatus}`;

  await prisma.$transaction([
    prisma.applicationStatusHistory.create({
      data: { applicationId, fromStatus, toStatus, note },
    }),
    prisma.activity.create({
      data: {
        userId,
        applicationId,
        type: toStatus === "REJECTED" ? "REJECTED" : toStatus === "OFFER" ? "OFFER_RECEIVED" : "STATUS_CHANGED",
        title: activityTitle,
        description: note,
      },
    }),
  ]);
}

export async function changeApplicationStatus(
  userId: string,
  id: string,
  status: ApplicationStatus,
  note?: string,
) {
  const existing = await prisma.jobApplication.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Application not found.", 404);
  if (existing.currentStatus === status) return existing;

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: { currentStatus: status },
  });

  await recordStatusChange(userId, id, existing.currentStatus, status, note);

  return updated;
}

export async function archiveApplication(userId: string, id: string, archived: boolean) {
  const existing = await prisma.jobApplication.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Application not found.", 404);

  return prisma.jobApplication.update({
    where: { id },
    data: { isArchived: archived, archivedAt: archived ? new Date() : null },
  });
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await prisma.jobApplication.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Application not found.", 404);

  return prisma.jobApplication.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function addManualActivity(
  userId: string,
  applicationId: string,
  data: { type: string; title: string; description?: string; occurredAt?: Date },
) {
  const application = await prisma.jobApplication.findFirst({ where: { id: applicationId, userId, deletedAt: null } });
  if (!application) throw new ServiceError("Application not found.", 404);

  return prisma.activity.create({
    data: {
      userId,
      applicationId,
      type: data.type as never,
      title: data.title,
      description: data.description,
      occurredAt: data.occurredAt ?? new Date(),
    },
  });
}

export async function addApplicationNote(userId: string, applicationId: string, content: string) {
  const application = await prisma.jobApplication.findFirst({ where: { id: applicationId, userId, deletedAt: null } });
  if (!application) throw new ServiceError("Application not found.", 404);

  const [note] = await prisma.$transaction([
    prisma.note.create({ data: { userId, applicationId, content } }),
    prisma.activity.create({
      data: { userId, applicationId, type: "NOTE_ADDED", title: "Note added" },
    }),
  ]);

  return note;
}
