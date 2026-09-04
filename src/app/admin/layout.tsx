import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { requireAdminSession, accessibleClientIds } from "@/lib/access";

// Shell compartido por todo /admin/* — sidebar flotante con la lista de
// clientes (se expande al hover o se puede fijar abierto) + el fondo con
// blobs de marca. Solo del lado admin, nunca en /c/[slug]. Un admin
// acotado solo ve en la lista los clientes que tiene asignados (ver
// src/lib/access.ts, CLAUDE.md "Administradores acotados").
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const allowedIds = await accessibleClientIds(session.id, session.role);

  const clients = await prisma.client.findMany({
    where: allowedIds ? { id: { in: allowedIds } } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, avatarUrl: true },
  });

  return (
    <div className="bg-app min-h-screen">
      <Sidebar clients={clients} isOwner={session.role === "owner"} />
      <div style={{ paddingLeft: 92 }}>{children}</div>
    </div>
  );
}
