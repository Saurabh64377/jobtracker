import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { interviewFeedbackSchema } from "@/lib/validations/interview";
import { saveInterviewFeedback } from "@/lib/services/interview-service";
import { ServiceError } from "@/lib/services/auth-service";

export const POST = withApiErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = interviewFeedbackSchema.parse(body);

    try {
      const feedback = await saveInterviewFeedback(user.id, id, input);
      return apiSuccess(feedback);
    } catch (err) {
      if (err instanceof ServiceError) return apiError(err.message, err.status);
      throw err;
    }
  },
);
