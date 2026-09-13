import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { passwordChangeSchema } from "@/lib/validations/settings";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const { currentPassword, newPassword } = passwordChangeSchema.parse(body);

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.password) {
    return apiError("This account signs in via a third-party provider and has no password to change.", 400);
  }

  const valid = await verifyPassword(currentPassword, dbUser.password);
  if (!valid) {
    return apiError("Your current password is incorrect.", 400);
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return apiSuccess({ ok: true });
});
