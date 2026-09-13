import "server-only";
import { prisma } from "@/lib/db";
import type { CompanyInput } from "@/lib/validations/company";
import { ServiceError } from "@/lib/services/auth-service";

function nullifyEmpty<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === "" ? null : value;
  }
  return result;
}

export async function listCompanies(userId: string, search?: string) {
  return prisma.company.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { applications: true, contacts: true, interviews: true } },
    },
  });
}

export async function getCompanyById(userId: string, id: string) {
  const company = await prisma.company.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      applications: { orderBy: { createdAt: "desc" } },
      contacts: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      interviews: { orderBy: { scheduledDate: "desc" } },
      notes_rel: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!company) throw new ServiceError("Company not found.", 404);
  return company;
}

export async function createCompany(userId: string, input: CompanyInput) {
  const existing = await prisma.company.findFirst({
    where: { userId, name: { equals: input.name.trim() }, deletedAt: null },
  });
  if (existing) throw new ServiceError("A company with this name already exists.", 409);

  return prisma.company.create({ data: { userId, ...nullifyEmpty(input) } as never });
}

export async function updateCompany(userId: string, id: string, input: CompanyInput) {
  const existing = await prisma.company.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Company not found.", 404);

  return prisma.company.update({ where: { id }, data: nullifyEmpty(input) as never });
}

export async function deleteCompany(userId: string, id: string) {
  const existing = await prisma.company.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Company not found.", 404);

  return prisma.company.update({ where: { id }, data: { deletedAt: new Date() } });
}
