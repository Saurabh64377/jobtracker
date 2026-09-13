import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { companySchema } from "@/lib/validations/company";
import { getCompanyById, updateCompany, deleteCompany } from "@/lib/services/company-service";
import { ServiceError } from "@/lib/services/auth-service";

type Params = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    const company = await getCompanyById(user.id, id);
    return apiSuccess(company);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const PATCH = withApiErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const body = await req.json();
  const input = companySchema.parse(body);

  try {
    const company = await updateCompany(user.id, id, input);
    return apiSuccess(company);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});

export const DELETE = withApiErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  try {
    await deleteCompany(user.id, id);
    return apiSuccess({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
