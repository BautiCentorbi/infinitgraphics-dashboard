import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "owner" | "admin" | "client";
    clientId: string | null;
    clientSlug: string | null;
  }

  interface Session {
    user: {
      role: "owner" | "admin" | "client";
      clientId: string | null;
      clientSlug: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "owner" | "admin" | "client";
    clientId: string | null;
    clientSlug: string | null;
  }
}
