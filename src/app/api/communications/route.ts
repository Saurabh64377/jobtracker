import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { communicationSchema } from "@/lib/validations/communication";
import { createCommunication } from "@/lib/services/communication-service";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = communicationSchema.parse(body);
  const communication = await createCommunication(user.id, input);
  return apiSuccess(communication, 201);
});
