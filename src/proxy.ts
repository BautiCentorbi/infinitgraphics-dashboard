import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Usa la config edge-safe (sin Prisma) — ver auth.config.ts. Protege /admin
// (role=owner u admin) y /c/[slug] (solo role=client, y solo el slug de su
// propio cliente). Sin sesión → redirect a /login. El acceso más fino —
// admin acotado a solo ciertos clientes, /admin/settings solo para owner —
// se resuelve en las páginas/actions (necesitan Prisma, ver src/lib/access.ts;
// el runtime Edge de este archivo no puede usarlo).
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

  if (isAdminRoute && session.user.role !== "owner" && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // /admin/settings (gestión de administradores y sus permisos) es
  // exclusivo del owner — un admin acotado ni siquiera debe ver la página.
  if (pathname.startsWith("/admin/settings") && session.user.role !== "owner") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
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
