import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/auth.config";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = loginSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return null;
      if (!user.isActive) return null;

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
      }

      if (trigger === "update" || !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true, name: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isActive = dbUser.isActive;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
          select: { role: true },
        });

        if (updated.role === "ADMIN") {
          await prisma.auditLog.create({
            data: { actorId: user.id, action: "ADMIN_LOGIN" },
          });
        }
      }
    },
  },
});
