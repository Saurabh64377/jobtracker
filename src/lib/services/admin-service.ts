import "server-only";
import { prisma } from "@/lib/db";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";
import { ServiceError } from "@/lib/services/auth-service";
import type { AuditAction, Role } from "@prisma/client";

export async function getPlatformOverview() {
  const now = new Date();

  const [
    totalUsers,
    activeUsers,
    newToday,
    newThisWeek,
    newThisMonth,
    totalApplications,
    totalInterviews,
    totalOffers,
    totalRejected,
    totalCompanies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfDay(now) } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfWeek(now) } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth(now) } } }),
    prisma.jobApplication.count({ where: { deletedAt: null } }),
    prisma.interview.count(),
    prisma.jobApplication.count({ where: { deletedAt: null, currentStatus: { in: ["OFFER", "ACCEPTED"] } } }),
    prisma.jobApplication.count({ where: { deletedAt: null, currentStatus: "REJECTED" } }),
    prisma.company.count({ where: { deletedAt: null } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    newToday,
    newThisWeek,
    newThisMonth,
    totalApplications,
    totalInterviews,
    totalOffers,
    totalRejected,
    totalCompanies,
  };
}

export type UserListFilters = { search?: string; role?: Role; status?: "active" | "inactive"; page?: number; pageSize?: number };

export async function listUsers(filters: UserListFilters = {}) {
  const { search, role, status, page = 1, pageSize = 20 } = filters;

  const where = {
    ...(search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {}),
    ...(role ? { role } : {}),
    ...(status ? { isActive: status === "active" } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { applications: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function setUserActive(adminId: string, userId: string, isActive: boolean) {
  if (adminId === userId && !isActive) {
    throw new ServiceError("You cannot deactivate your own account.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ServiceError("User not found.", 404);

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await writeAuditLog(adminId, isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED", userId, { email: user.email });
}

export async function setUserRole(adminId: string, userId: string, role: Role) {
  if (adminId === userId) {
    throw new ServiceError("You cannot change your own role.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ServiceError("User not found.", 404);

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await writeAuditLog(adminId, "USER_ROLE_CHANGED", userId, { email: user.email, from: user.role, to: role });
}

export async function deleteUserAccount(adminId: string, userId: string) {
  if (adminId === userId) {
    throw new ServiceError("You cannot delete your own account.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ServiceError("User not found.", 404);

  await prisma.user.delete({ where: { id: userId } });
  await writeAuditLog(adminId, "USER_DELETED", userId, { email: user.email });
}

export async function writeAuditLog(actorId: string, action: AuditAction, targetUserId?: string, details?: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: { actorId, action, targetUserId, details: details ? JSON.parse(JSON.stringify(details)) : undefined },
  });
}

export async function listAuditLogs(page = 1, pageSize = 30) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  const targetIds = [...new Set(items.map((i) => i.targetUserId).filter((id): id is string => !!id))];
  const targets = await prisma.user.findMany({ where: { id: { in: targetIds } }, select: { id: true, email: true } });
  const targetMap = new Map(targets.map((t) => [t.id, t.email]));

  return {
    items: items.map((i) => ({ ...i, targetEmail: i.targetUserId ? targetMap.get(i.targetUserId) : null })),
    total,
    page,
    pageSize,
  };
}

export async function getPlatformAnalytics() {
  const now = new Date();
  const since = subDays(now, 29);

  const [registrations, applications, interviews, offers, rejections, sources, roles, workModes] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.jobApplication.findMany({ where: { createdAt: { gte: since }, deletedAt: null }, select: { createdAt: true } }),
    prisma.interview.count({ where: { createdAt: { gte: since } } }),
    prisma.jobApplication.count({ where: { deletedAt: null, currentStatus: { in: ["OFFER", "ACCEPTED"] } } }),
    prisma.jobApplication.count({ where: { deletedAt: null, currentStatus: "REJECTED" } }),
    prisma.jobApplication.groupBy({ by: ["jobSource"], _count: { _all: true }, where: { deletedAt: null } }),
    prisma.jobApplication.groupBy({
      by: ["jobTitle"],
      _count: { _all: true },
      where: { deletedAt: null },
      orderBy: { _count: { jobTitle: "desc" } },
      take: 8,
    }),
    prisma.jobApplication.groupBy({ by: ["workMode"], _count: { _all: true }, where: { deletedAt: null } }),
  ]);

  function bucketByDay(dates: Date[]) {
    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      buckets.set(day.toISOString().slice(0, 10), 0);
    }
    for (const d of dates) {
      const key = startOfDay(d).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([date, count]) => ({ date: date.slice(5), count }));
  }

  return {
    registrationsByDay: bucketByDay(registrations.map((r) => r.createdAt)),
    applicationsByDay: bucketByDay(applications.map((a) => a.createdAt)),
    interviews,
    offers,
    rejections,
    sources: sources.map((s) => ({ source: s.jobSource, count: s._count._all })).sort((a, b) => b.count - a.count),
    roles: roles.map((r) => ({ role: r.jobTitle, count: r._count._all })),
    workModes: workModes.map((w) => ({ mode: w.workMode, count: w._count._all })),
  };
}
