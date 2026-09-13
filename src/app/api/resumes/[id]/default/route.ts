import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { setDefaultResume } from "@/lib/services/resume-service";
import { ServiceError } from "@/lib/services/auth-service";

export const POST = withApiErrorHandling(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    try {
      await setDefaultResume(user.id, id);
      return apiSuccess({ ok: true });
    } catch (err) {
      if (err instanceof ServiceError) return apiError(err.message, err.status);
      throw err;
    }
  },
);
