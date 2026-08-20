import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sin el Credentials provider (que necesita Prisma/
// bcrypt, no soportados en el runtime Edge donde corre el middleware). Se
// reusa acá y en auth.ts (que le agrega el provider real) para no duplicar
// callbacks/pages. Patrón estándar de NextAuth v5 para middleware.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.clientId = user.clientId;
        token.clientSlug = user.clientSlug;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "admin" | "client";
        session.user.clientId = token.clientId as string | null;
        session.user.clientSlug = token.clientSlug as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
