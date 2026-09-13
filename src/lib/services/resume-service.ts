import "server-only";
import { prisma } from "@/lib/db";
import { ServiceError } from "@/lib/services/auth-service";
import { saveFile, deleteStoredFile, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/services/file-storage";

export async function listResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

export async function uploadResume(
  userId: string,
  file: File,
  meta: { name: string; targetRole?: string; version?: string; notes?: string; isDefault?: boolean },
) {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    throw new ServiceError("Only PDF, Word documents, or images are allowed.", 400);
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ServiceError("File is too large (max 10MB).", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = await saveFile(buffer, file.type, `jobtrack/resumes/${userId}`);

  if (meta.isDefault) {
    await prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.resume.create({
    data: {
      userId,
      name: meta.name,
      targetRole: meta.targetRole || null,
      version: meta.version || null,
      notes: meta.notes || null,
      isDefault: !!meta.isDefault,
      fileUrl: key,
      fileSize: file.size,
      mimeType: file.type,
    },
  });
}

export async function setDefaultResume(userId: string, id: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId, deletedAt: null } });
  if (!resume) throw new ServiceError("Resume not found.", 404);

  await prisma.$transaction([
    prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.resume.update({ where: { id }, data: { isDefault: true } }),
  ]);
}

export async function deleteResume(userId: string, id: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId, deletedAt: null } });
  if (!resume) throw new ServiceError("Resume not found.", 404);

  await prisma.resume.update({ where: { id }, data: { deletedAt: new Date() } });
  await deleteStoredFile(resume.fileUrl, resume.mimeType);
}

export async function getResumeForDownload(userId: string, id: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId, deletedAt: null } });
  if (!resume) throw new ServiceError("Resume not found.", 404);
  return resume;
}
