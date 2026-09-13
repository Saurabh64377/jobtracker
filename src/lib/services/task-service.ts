import "server-only";
import { prisma } from "@/lib/db";
import type { TaskInput } from "@/lib/validations/task";
import { ServiceError } from "@/lib/services/auth-service";

function nullifyEmpty<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === "" ? null : value;
  }
  return result;
}

export async function listTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: { application: { select: { id: true, jobTitle: true } } },
  });
}

export async function createTask(userId: string, input: TaskInput) {
  const { applicationId, ...rest } = input;
  return prisma.task.create({
    data: { userId, applicationId: applicationId || null, ...nullifyEmpty(rest) } as never,
  });
}

export async function updateTask(userId: string, id: string, input: Partial<TaskInput>) {
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("Task not found.", 404);

  const { applicationId, ...rest } = input;
  return prisma.task.update({
    where: { id },
    data: {
      ...(applicationId !== undefined ? { applicationId: applicationId || null } : {}),
      ...nullifyEmpty(rest),
      ...(input.status === "DONE" && existing.status !== "DONE" ? { completedAt: new Date() } : {}),
      ...(input.status && input.status !== "DONE" ? { completedAt: null } : {}),
    } as never,
  });
}

export async function deleteTask(userId: string, id: string) {
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw new ServiceError("Task not found.", 404);
  return prisma.task.delete({ where: { id } });
}
