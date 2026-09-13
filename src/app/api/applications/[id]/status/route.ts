import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { changeStatusSchema } from "@/lib/validations/application";
import { changeApplicationStatus } from "@/lib/services/application-service";
import { ServiceError } from "@/lib/services/auth-service";

export const PATCH = withApiErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const { status, note } = changeStatusSchema.parse(body);

    try {
      const application = await changeApplicationStatus(user.id, id, status, note);
      return apiSuccess(application);
    } catch (err) {
      if (err instanceof ServiceError) return apiError(err.message, err.status);
      throw err;
    }
  },
);
