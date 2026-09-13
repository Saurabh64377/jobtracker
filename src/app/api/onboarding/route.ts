import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { prisma } from "@/lib/db";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json().catch(() => ({}));
  const input = onboardingSchema.parse(body);

  await prisma.user.update({
    where: { id: user.id },
    data: { ...input, onboardingCompleted: true },
  });

  return apiSuccess({ ok: true });
});
