import "server-only";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { RegisterInput } from "@/lib/validations/auth";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ServiceError("An account with this email already exists.", 409);
  }

  const password = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same way whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user || !user.password) {
    return;
  }

  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  return { token, user };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new ServiceError("This reset link is invalid or has expired.", 400);
  }

  const password = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
