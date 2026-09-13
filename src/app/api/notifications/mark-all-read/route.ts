import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { markAllAsRead } from "@/lib/services/notification-service";

export const POST = withApiErrorHandling(async () => {
  const user = await requireUser();
  await markAllAsRead(user.id);
  return apiSuccess({ ok: true });
});
