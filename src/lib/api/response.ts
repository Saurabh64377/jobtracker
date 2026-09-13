import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/api/guards";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: { message, details } }, { status });
}

export function apiUnauthorized(message = "Unauthorized") {
  return apiError(message, 401);
}

export function apiForbidden(message = "Forbidden") {
  return apiError(message, 403);
}

export function apiNotFound(message = "Not found") {
  return apiError(message, 404);
}

/**
 * Wraps a route handler so unexpected errors never leak raw stack traces /
 * database error messages to the client (spec: never expose raw DB errors).
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AuthError) {
        return apiError(err.message, err.status);
      }
      if (err instanceof ZodError) {
        return apiError("Validation failed", 422, err.flatten());
      }
      console.error("[API_ERROR]", err);
      return apiError("Something went wrong. Please try again.", 500);
    }
  };
}
