import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { applicationSchema } from "@/lib/validations/application";
import {
  getApplicationById,
  updateApplication,
  deleteApplication,
  archiveApplication,
} from "@/lib/services/application-service";
import { ServiceError as AuthServiceError } from "@/lib/services/auth-service";

type Params = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    const application = await getApplicationById(user.id, id);
    return apiSuccess(application);
  } catch (err) {
    if (err instanceof AuthServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const body = await req.json();

  if (typeof body.isArchived === "boolean" && Object.keys(body).length === 1) {
    const application = await archiveApplication(user.id, id, body.isArchived);
    return apiSuccess(application);
  }

  const input = applicationSchema.parse(body);
  try {
    const application = await updateApplication(user.id, id, input);
    return apiSuccess(application);
  } catch (err) {
    if (err instanceof AuthServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const DELETE = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    await deleteApplication(user.id, id);
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof AuthServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
