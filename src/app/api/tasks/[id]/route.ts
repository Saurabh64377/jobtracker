import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { taskSchema } from "@/lib/validations/task";
import { updateTask, deleteTask } from "@/lib/services/task-service";
import { ServiceError } from "@/lib/services/auth-service";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const body = await req.json();
  const input = taskSchema.partial().parse(body);

  try {
    const task = await updateTask(user.id, id, input);
    return apiSuccess(task);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const DELETE = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    await deleteTask(user.id, id);
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
