import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { globalSearch } from "@/lib/services/search-service";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await globalSearch(user.id, q);
  return apiSuccess(results);
});
