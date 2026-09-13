import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { interviewSchema } from "@/lib/validations/interview";
import { listInterviews, createInterview } from "@/lib/services/interview-service";
import { ServiceError } from "@/lib/services/auth-service";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const params = req.nextUrl.searchParams;
  const from = params.get("from") ? new Date(params.get("from")!) : undefined;
  const to = params.get("to") ? new Date(params.get("to")!) : undefined;
  const interviews = await listInterviews(user.id, { from, to });
  return apiSuccess(interviews);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = interviewSchema.parse(body);

  try {
    const interview = await createInterview(user.id, input);
    return apiSuccess(interview, 201);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
