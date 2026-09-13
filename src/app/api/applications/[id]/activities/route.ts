import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { addManualActivity } from "@/lib/services/application-service";
import { ServiceError } from "@/lib/services/auth-service";

const activitySchema = z.object({
  type: z.enum([
    "EMAIL_SENT",
    "EMAIL_RECEIVED",
    "WHATSAPP_SENT",
    "WHATSAPP_RECEIVED",
    "LINKEDIN_MESSAGE",
    "PHONE_CALL",
    "RECRUITER_RESPONSE",
    "FOLLOW_UP",
    "GENERAL",
  ]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  occurredAt: z.coerce.date().optional(),
});

export const POST = withApiErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = activitySchema.parse(body);

    try {
      const activity = await addManualActivity(user.id, id, input);
      return apiSuccess(activity, 201);
    } catch (err) {
      if (err instanceof ServiceError) return apiError(err.message, err.status);
      throw err;
    }
  },
);
