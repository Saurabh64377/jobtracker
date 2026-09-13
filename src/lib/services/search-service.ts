import "server-only";
import { prisma } from "@/lib/db";

export type SearchResult = {
  id: string;
  type: "application" | "company" | "contact" | "interview" | "note";
  title: string;
  subtitle?: string;
  href: string;
};

export async function globalSearch(userId: string, query: string, limit = 5): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [applications, companies, contacts, interviews, notes] = await Promise.all([
    prisma.jobApplication.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [{ jobTitle: { contains: q } }, { companyNameRaw: { contains: q } }],
      },
      select: { id: true, jobTitle: true, companyNameRaw: true, company: { select: { name: true } } },
      take: limit,
    }),
    prisma.company.findMany({
      where: { userId, deletedAt: null, name: { contains: q } },
      select: { id: true, name: true, industry: true },
      take: limit,
    }),
    prisma.contact.findMany({
      where: { userId, deletedAt: null, name: { contains: q } },
      select: { id: true, name: true, designation: true },
      take: limit,
    }),
    prisma.interview.findMany({
      where: {
        userId,
        application: { jobTitle: { contains: q } },
      },
      select: { id: true, round: true, application: { select: { jobTitle: true } } },
      take: limit,
    }),
    prisma.note.findMany({
      where: { userId, content: { contains: q } },
      select: { id: true, content: true, applicationId: true },
      take: limit,
    }),
  ]);

  const results: SearchResult[] = [];

  for (const a of applications) {
    results.push({
      id: a.id,
      type: "application",
      title: a.jobTitle,
      subtitle: a.company?.name ?? a.companyNameRaw ?? undefined,
      href: `/applications/${a.id}`,
    });
  }
  for (const c of companies) {
    results.push({ id: c.id, type: "company", title: c.name, subtitle: c.industry ?? undefined, href: `/companies/${c.id}` });
  }
  for (const c of contacts) {
    results.push({ id: c.id, type: "contact", title: c.name, subtitle: c.designation ?? undefined, href: `/contacts/${c.id}` });
  }
  for (const i of interviews) {
    results.push({
      id: i.id,
      type: "interview",
      title: `${i.round.replace(/_/g, " ")} — ${i.application.jobTitle}`,
      href: `/interviews/${i.id}`,
    });
  }
  for (const n of notes) {
    if (!n.applicationId) continue;
    results.push({
      id: n.id,
      type: "note",
      title: n.content.slice(0, 80),
      subtitle: "Note",
      href: `/applications/${n.applicationId}`,
    });
  }

  return results;
}
