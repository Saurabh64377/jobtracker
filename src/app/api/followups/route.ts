import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { followUpSchema } from "@/lib/validations/task";
import { listFollowUps, createFollowUp } from "@/lib/services/followup-service";

export const GET = withApiErrorHandling(async () => {
  const user = await requireUser();
  const followUps = await listFollowUps(user.id);
  return apiSuccess(followUps);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = followUpSchema.parse(body);
  const followUp = await createFollowUp(user.id, input);
  return apiSuccess(followUp, 201);
});
