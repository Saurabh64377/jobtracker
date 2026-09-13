import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { markAsRead } from "@/lib/services/notification-service";

export const PATCH = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await params;
  await markAsRead(user.id, id);
  return apiSuccess({ ok: true });
});
