import { requireAdmin } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { getPlatformAnalytics } from "@/lib/services/admin-service";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const analytics = await getPlatformAnalytics();
  return apiSuccess(analytics);
});
