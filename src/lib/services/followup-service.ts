import "server-only";
import { prisma } from "@/lib/db";
import type { FollowUpInput } from "@/lib/validations/task";
import { ServiceError } from "@/lib/services/auth-service";

function nullifyEmpty<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === "" ? null : value;
  }
  return result;
}

export async function listFollowUps(userId: string) {
  return prisma.followUp.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: {
      application: { select: { id: true, jobTitle: true } },
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
    },
  });
}

export async function createFollowUp(userId: string, input: FollowUpInput) {
  const { applicationId, companyId, contactId, ...rest } = input;
  return prisma.followUp.create({
    data: {
      userId,
      applicationId: applicationId || null,
      companyId: companyId || null,
      contactId: contactId || null,
      ...nullifyEmpty(rest),
    } as never,
  });
}

export async function completeFollowUp(userId: string, id: string, completed: boolean) {
  const existing = await prisma.followUp.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("Follow-up not found.", 404);

  return prisma.followUp.update({
    where: { id },
    data: { status: completed ? "COMPLETED" : "PENDING", completedAt: completed ? new Date() : null },
  });
}

export async function deleteFollowUp(userId: string, id: string) {
  const existing = await prisma.followUp.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("Follow-up not found.", 404);
  return prisma.followUp.delete({ where: { id } });
}
