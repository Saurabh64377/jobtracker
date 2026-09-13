import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { listNotifications, getUnreadCount } from "@/lib/services/notification-service";

export const GET = withApiErrorHandling(async () => {
  const user = await requireUser();
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(user.id),
    getUnreadCount(user.id),
  ]);
  return apiSuccess({ notifications, unreadCount });
});
