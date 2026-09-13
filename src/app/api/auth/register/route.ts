import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser, ServiceError } from "@/lib/services/auth-service";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = registerSchema.parse(body);

  try {
    const user = await registerUser(input);
    return apiSuccess(user, 201);
  } catch (err) {
    if (err instanceof ServiceError) {
      return apiError(err.message, err.status);
    }
    throw err;
  }
});
