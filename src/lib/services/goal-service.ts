import "server-only";
import { prisma } from "@/lib/db";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { GoalInput } from "@/lib/validations/settings";

export async function upsertCurrentGoal(userId: string, input: GoalInput) {
  const now = new Date();
  const periodStart = input.period === "WEEKLY" ? startOfWeek(now) : startOfMonth(now);
  const periodEnd = input.period === "WEEKLY" ? endOfWeek(now) : endOfMonth(now);

  return prisma.goal.upsert({
    where: { userId_period_periodStart: { userId, period: input.period, periodStart } },
    create: { userId, period: input.period, periodStart, periodEnd, ...withoutPeriod(input) },
    update: { ...withoutPeriod(input) },
  });
}

function withoutPeriod(input: GoalInput) {
  const { period, ...rest } = input;
  void period;
  return rest;
}
