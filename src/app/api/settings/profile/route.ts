import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { profileSchema } from "@/lib/validations/settings";
import { prisma } from "@/lib/db";

export const PATCH = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = profileSchema.parse(body);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name,
      targetRole: input.targetRole || null,
      preferredLocations: input.preferredLocations ?? undefined,
      expectedSalaryMin: input.expectedSalaryMin,
      expectedSalaryMax: input.expectedSalaryMax,
      preferredWorkMode: input.preferredWorkMode,
      monthlyApplicationGoal: input.monthlyApplicationGoal,
    },
  });

  return apiSuccess({ id: updated.id, name: updated.name });
});
