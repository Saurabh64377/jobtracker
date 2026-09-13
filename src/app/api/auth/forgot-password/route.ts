import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/lib/services/auth-service";
import { sendPasswordResetEmail } from "@/lib/services/email-service";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { email } = forgotPasswordSchema.parse(body);

  const result = await requestPasswordReset(email);
  if (result) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${result.token}`;
    await sendPasswordResetEmail(result.user.email, resetUrl);
  }

  // Same response regardless of whether the account exists.
  return apiSuccess({
    message: "If an account with that email exists, a reset link has been sent.",
  });
});
