import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { getCalendarEvents } from "@/lib/services/calendar-service";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const params = req.nextUrl.searchParams;
  const start = params.get("start");
  const end = params.get("end");

  if (!start || !end) {
    return apiError("start and end query params are required", 400);
  }

  const events = await getCalendarEvents(user.id, new Date(start), new Date(end));
  return apiSuccess(events);
});
