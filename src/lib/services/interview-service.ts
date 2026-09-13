import "server-only";
import { prisma } from "@/lib/db";
import type { InterviewInput, InterviewFeedbackInput } from "@/lib/validations/interview";
import { ServiceError } from "@/lib/services/auth-service";

function nullifyEmpty<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === "" ? null : value;
  }
  return result;
}

export async function listInterviews(userId: string, filters: { from?: Date; to?: Date } = {}) {
  return prisma.interview.findMany({
    where: {
      userId,
      ...(filters.from || filters.to
        ? { scheduledDate: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } }
        : {}),
    },
    orderBy: { scheduledDate: "desc" },
    include: {
      application: { select: { id: true, jobTitle: true, companyNameRaw: true, company: { select: { name: true } } } },
      interviewerContact: { select: { id: true, name: true } },
    },
  });
}

export async function getInterviewById(userId: string, id: string) {
  const interview = await prisma.interview.findFirst({
    where: { id, userId },
    include: {
      application: { select: { id: true, jobTitle: true, companyNameRaw: true, company: { select: { name: true } } } },
      interviewerContact: true,
      questions: { orderBy: { createdAt: "desc" } },
      feedback: true,
    },
  });
  if (!interview) throw new ServiceError("Interview not found.", 404);
  return interview;
}

export async function createInterview(userId: string, input: InterviewInput) {
  const application = await prisma.jobApplication.findFirst({
    where: { id: input.applicationId, userId, deletedAt: null },
  });
  if (!application) throw new ServiceError("Application not found.", 404);

  const { applicationId, interviewerContactId, difficulty, ...rest } = input;

  const interview = await prisma.interview.create({
    data: {
      userId,
      applicationId,
      companyId: application.companyId,
      interviewerContactId: interviewerContactId || null,
      difficulty: difficulty || null,
      ...nullifyEmpty(rest),
    } as never,
  });

  await prisma.activity.create({
    data: {
      userId,
      applicationId,
      type: "INTERVIEW_SCHEDULED",
      title: `${input.round.replace(/_/g, " ")} interview scheduled`,
      occurredAt: new Date(),
    },
  });

  return interview;
}

export async function updateInterview(userId: string, id: string, input: InterviewInput) {
  const existing = await prisma.interview.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("Interview not found.", 404);

  const { applicationId, interviewerContactId, difficulty, ...rest } = input;
  void applicationId;

  const updated = await prisma.interview.update({
    where: { id },
    data: {
      interviewerContactId: interviewerContactId || null,
      difficulty: difficulty || null,
      ...nullifyEmpty(rest),
    } as never,
  });

  if (existing.status !== "COMPLETED" && input.status === "COMPLETED") {
    await prisma.activity.create({
      data: {
        userId,
        applicationId: existing.applicationId,
        type: "INTERVIEW_COMPLETED",
        title: `${input.round.replace(/_/g, " ")} interview completed`,
      },
    });
  } else if (existing.status !== "CANCELLED" && input.status === "CANCELLED") {
    await prisma.activity.create({
      data: {
        userId,
        applicationId: existing.applicationId,
        type: "INTERVIEW_CANCELLED",
        title: `${input.round.replace(/_/g, " ")} interview cancelled`,
      },
    });
  }

  return updated;
}

export async function deleteInterview(userId: string, id: string) {
  const existing = await prisma.interview.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("Interview not found.", 404);
  return prisma.interview.delete({ where: { id } });
}

export async function saveInterviewFeedback(userId: string, interviewId: string, input: InterviewFeedbackInput) {
  const interview = await prisma.interview.findFirst({ where: { id: interviewId, userId } });
  if (!interview) throw new ServiceError("Interview not found.", 404);

  return prisma.interviewFeedback.upsert({
    where: { interviewId },
    create: { interviewId, ...nullifyEmpty(input) } as never,
    update: nullifyEmpty(input) as never,
  });
}
