import type { NextAuthConfig } from "next-auth";

// Config usable in the Edge middleware runtime (no Node-only APIs / adapter here).
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    // Runs in both the Edge middleware and the full Node config, so the
    // middleware's `authorized` check below actually sees `role`/`id` on
    // `auth.user` — without this, session.user.role is always undefined
    // in the Edge runtime and every /admin request gets blocked, even for
    // real admins.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/applications") ||
        pathname.startsWith("/interviews") ||
        pathname.startsWith("/calendar") ||
        pathname.startsWith("/companies") ||
        pathname.startsWith("/contacts") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/analytics") ||
        pathname.startsWith("/resumes") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/admin");

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "ADMIN";
      }

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
