import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
};

/**
 * Verifies the session AND re-checks isActive/role against the database, so
 * a deactivated or role-changed account loses access immediately rather than
 * waiting for its JWT to expire.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("You must be signed in.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new AuthError("Your account is not accessible.", 401);
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new AuthError("Admin access required.", 403);
  }
  return user;
}
