import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { interviewSchema } from "@/lib/validations/interview";
import { getInterviewById, updateInterview, deleteInterview } from "@/lib/services/interview-service";
import { ServiceError } from "@/lib/services/auth-service";

type Params = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    const interview = await getInterviewById(user.id, id);
    return apiSuccess(interview);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const body = await req.json();
  const input = interviewSchema.parse(body);

  try {
    const interview = await updateInterview(user.id, id, input);
    return apiSuccess(interview);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const DELETE = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    await deleteInterview(user.id, id);
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
