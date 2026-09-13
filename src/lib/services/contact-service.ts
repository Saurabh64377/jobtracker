import "server-only";
import { prisma } from "@/lib/db";
import type { ContactInput } from "@/lib/validations/contact";
import { ServiceError } from "@/lib/services/auth-service";

function nullifyEmpty<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === "" ? null : value;
  }
  return result;
}

export async function listContacts(userId: string, search?: string) {
  return prisma.contact.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(search
        ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { communications: true, interviews: true } },
    },
  });
}

export async function getContactById(userId: string, id: string) {
  const contact = await prisma.contact.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      company: true,
      applications: { orderBy: { createdAt: "desc" } },
      communications: { orderBy: { occurredAt: "desc" } },
      interviews: { orderBy: { scheduledDate: "desc" } },
      notes_rel: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!contact) throw new ServiceError("Contact not found.", 404);
  return contact;
}

export async function createContact(userId: string, input: ContactInput) {
  const { companyId, ...rest } = input;
  return prisma.contact.create({
    data: { userId, companyId: companyId || null, ...nullifyEmpty(rest) } as never,
  });
}

export async function updateContact(userId: string, id: string, input: ContactInput) {
  const existing = await prisma.contact.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Contact not found.", 404);

  const { companyId, ...rest } = input;
  return prisma.contact.update({
    where: { id },
    data: { companyId: companyId || null, ...nullifyEmpty(rest) } as never,
  });
}

export async function deleteContact(userId: string, id: string) {
  const existing = await prisma.contact.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new ServiceError("Contact not found.", 404);

  return prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
}
