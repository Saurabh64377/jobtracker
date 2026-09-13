import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { setUserActive, setUserRole, deleteUserAccount } from "@/lib/services/admin-service";
import { ServiceError } from "@/lib/services/auth-service";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.union([
  z.object({ isActive: z.boolean() }),
  z.object({ role: z.enum(["USER", "ADMIN"]) }),
]);

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: Params) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const input = patchSchema.parse(body);

  try {
    if ("isActive" in input) {
      await setUserActive(admin.id, id, input.isActive);
    } else {
      await setUserRole(admin.id, id, input.role);
    }
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const DELETE = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const admin = await requireAdmin();
  const { id } = await params;

  try {
    await deleteUserAccount(admin.id, id);
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
