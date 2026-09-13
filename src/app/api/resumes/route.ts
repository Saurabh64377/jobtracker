import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { listResumes, uploadResume } from "@/lib/services/resume-service";
import { ServiceError } from "@/lib/services/auth-service";

export const GET = withApiErrorHandling(async () => {
  const user = await requireUser();
  const resumes = await listResumes(user.id);
  return apiSuccess(resumes);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const form = await req.formData();

  const file = form.get("file");
  if (!(file instanceof File)) {
    return apiError("A file is required.", 400);
  }

  const name = String(form.get("name") ?? file.name);
  const targetRole = form.get("targetRole")?.toString();
  const version = form.get("version")?.toString();
  const notes = form.get("notes")?.toString();
  const isDefault = form.get("isDefault") === "true";

  try {
    const resume = await uploadResume(user.id, file, { name, targetRole, version, notes, isDefault });
    return apiSuccess(resume, 201);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
