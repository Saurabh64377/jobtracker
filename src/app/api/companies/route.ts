import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { companySchema } from "@/lib/validations/company";
import { listCompanies, createCompany } from "@/lib/services/company-service";
import { ServiceError } from "@/lib/services/auth-service";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const companies = await listCompanies(user.id, search);
  return apiSuccess(companies);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = companySchema.parse(body);

  try {
    const company = await createCompany(user.id, input);
    return apiSuccess(company, 201);
  } catch (err) {
    if (err instanceof ServiceError) return apiError(err.message, err.status);
    throw err;
  }
});
