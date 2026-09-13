import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword, ServiceError } from "@/lib/services/auth-service";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { token, password } = resetPasswordSchema.parse(body);

  try {
    await resetPassword(token, password);
    return apiSuccess({ message: "Password updated. You can now sign in." });
  } catch (err) {
    if (err instanceof ServiceError) {
      return apiError(err.message, err.status);
    }
    throw err;
  }
});
