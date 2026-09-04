import { requireAdminSession } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { AdminsSection } from "./AdminsSection";
import { PendingRequests } from "./PendingRequests";

export const dynamic = "force-dynamic";

// Owner-only (ver src/proxy.ts + requireAdminSession de abajo, que además
// redirige si por algún motivo un admin acotado llega hasta acá).
export default async function SettingsPage() {
  const session = await requireAdminSession();

  const [admins, clients, pendingRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["owner", "admin"] } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        canCreateClients: true,
        clientAccess: { select: { clientId: true } },
      },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.clientRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { requestedBy: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-10 py-16">
      <h1 className="mb-1.5 text-center text-2xl font-bold tracking-tight font-display">Configuración</h1>
      <p className="mb-8 text-center text-sm" style={{ color: "var(--text-dim)" }}>
        Administración de la cuenta y del equipo.
      </p>

      {pendingRequests.length > 0 && (
        <PendingRequests
          requests={pendingRequests.map((r) => ({
            id: r.id,
            name: r.name,
            requesterEmail: r.requestedBy.email,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      )}

      <AdminsSection
        admins={admins.map((a) => ({
          ...a,
          // La query solo trajo role in [owner, admin] — nunca client.
          role: a.role as "owner" | "admin",
          createdAt: a.createdAt.toISOString(),
          clientIds: a.clientAccess.map((c) => c.clientId),
        }))}
        clients={clients}
        currentUserId={session.id}
      />
    </div>
  );
}
