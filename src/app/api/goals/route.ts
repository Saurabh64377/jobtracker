import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { goalSchema } from "@/lib/validations/settings";
import { upsertCurrentGoal } from "@/lib/services/goal-service";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = goalSchema.parse(body);
  const goal = await upsertCurrentGoal(user.id, input);
  return apiSuccess(goal);
});
