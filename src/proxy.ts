import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Usa la config edge-safe (sin Prisma) — ver auth.config.ts. Protege /admin
// (solo role=admin) y /c/[slug] (solo role=client, y solo el slug de su
// propio cliente). Sin sesión → redirect a /login.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminRoute = pathname.startsWith("/admin");
  const clientRouteMatch = pathname.match(/^\/c\/([^/]+)/);

  if (!isAdminRoute && !clientRouteMatch) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (clientRouteMatch) {
    const requestedSlug = clientRouteMatch[1];
    if (session.user.role !== "client" || session.user.clientSlug !== requestedSlug) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/c/:path*"],
};
