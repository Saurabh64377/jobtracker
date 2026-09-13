import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { listUsers } from "@/lib/services/admin-service";
import type { Role } from "@prisma/client";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const params = req.nextUrl.searchParams;

  const search = params.get("search") ?? undefined;
  const role = (params.get("role") as Role | null) ?? undefined;
  const status = (params.get("status") as "active" | "inactive" | null) ?? undefined;
  const page = Number(params.get("page") ?? "1");

  const result = await listUsers({ search, role: role ?? undefined, status: status ?? undefined, page });
  return apiSuccess(result);
});
