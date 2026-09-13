import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { applicationSchema } from "@/lib/validations/application";
import { listApplications, createApplication } from "@/lib/services/application-service";
import type { ApplicationStatus } from "@prisma/client";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const params = req.nextUrl.searchParams;

  const status = params.get("status")?.split(",").filter(Boolean) as ApplicationStatus[] | undefined;
  const priority = params.get("priority")?.split(",").filter(Boolean);
  const workMode = params.get("workMode")?.split(",").filter(Boolean);
  const source = params.get("source")?.split(",").filter(Boolean);
  const tagIds = params.get("tagIds")?.split(",").filter(Boolean);
  const search = params.get("search") ?? undefined;
  const archived = params.get("archived") === "true";
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "200");

  const result = await listApplications(user.id, {
    status,
    priority,
    workMode,
    source,
    tagIds,
    search,
    archived,
    page,
    pageSize,
  });

  return apiSuccess(result);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = applicationSchema.parse(body);

  const application = await createApplication(user.id, input);
  return apiSuccess(application, 201);
});
