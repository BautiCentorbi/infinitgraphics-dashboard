import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Punto único de verificación de acceso admin/owner a un cliente. Ver
// CLAUDE.md, "Administradores acotados" (2026-09-04): el owner ve/opera
// todos los clientes sin restricción; un admin acotado solo los que tiene
// asignados en AdminClientAccess. Usar SIEMPRE server-side (páginas y
// server actions) — nunca confiar solo en lo que la UI oculta, mismo
// criterio que ya se usaba para /c/[slug] (ver ARCHITECTURE.md).

export type AdminSession = {
  id: string;
  email: string;
  role: "owner" | "admin";
};

// Para páginas: si no hay sesión admin/owner, redirige a /login (el
// middleware ya debería haber cortado esto antes, esto es la segunda
// verificación real).
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "owner" && session.user.role !== "admin")) {
    redirect("/login");
  }
  return { id: session.user.id, email: session.user.email ?? "", role: session.user.role };
}

// Para páginas/actions que operan sobre un cliente puntual (por clientId).
// Un owner siempre pasa. Un admin acotado necesita una fila en
// AdminClientAccess para ese cliente — si no la tiene, se lo manda de
// vuelta a /admin (no ve ni un error, directamente no existe para él).
export async function requireClientAccess(clientId: string): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (session.role === "owner") return session;

  const access = await prisma.adminClientAccess.findUnique({
    where: { userId_clientId: { userId: session.id, clientId } },
  });
  if (!access) redirect("/admin");
  return session;
}

// Misma verificación que requireClientAccess pero a partir del slug (varias
// páginas/actions solo tienen el slug a mano, no el clientId directo).
export async function requireClientAccessBySlug(slug: string): Promise<{ session: AdminSession; clientId: string }> {
  const session = await requireAdminSession();
  const client = await prisma.client.findUnique({ where: { slug }, select: { id: true } });
  if (!client) redirect("/admin");
  if (session.role !== "owner") {
    const access = await prisma.adminClientAccess.findUnique({
      where: { userId_clientId: { userId: session.id, clientId: client.id } },
    });
    if (!access) redirect("/admin");
  }
  return { session, clientId: client.id };
}

// Boolean puro, sin redirect — para las server actions que reciben clientId
// directo y quieren devolver un mensaje de error propio en vez de cortar la
// navegación (mismo patrón que ya usan las actions de /c/[slug]).
export async function hasClientAccess(userId: string, role: string, clientId: string): Promise<boolean> {
  if (role === "owner") return true;
  if (role !== "admin") return false;
  const access = await prisma.adminClientAccess.findUnique({
    where: { userId_clientId: { userId, clientId } },
  });
  return !!access;
}

// Ids de los clientes que puede ver este usuario admin/owner — para filtrar
// listados (sidebar, dashboard). `null` significa "todos" (owner).
export async function accessibleClientIds(userId: string, role: string): Promise<string[] | null> {
  if (role === "owner") return null;
  const rows = await prisma.adminClientAccess.findMany({
    where: { userId },
    select: { clientId: true },
  });
  return rows.map((r) => r.clientId);
}
