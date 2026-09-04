import { prisma } from "@/lib/prisma";
import { requireAdminSession, accessibleClientIds } from "@/lib/access";
import { NewClientForm } from "./NewClientForm";
import { ClientRow } from "./ClientRow";
import { MyClientRequests } from "./MyClientRequests";

// Siempre dinámico: lee la lista de clientes en vivo, no tiene sentido
// prerenderizarla estáticamente (y el build fallaría sin DB disponible). Un
// admin acotado solo ve acá los clientes que tiene asignados (ver
// src/lib/access.ts).
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdminSession();
  const allowedIds = await accessibleClientIds(session.id, session.role);
  const isOwner = session.role === "owner";

  const [clients, myRequests] = await Promise.all([
    prisma.client.findMany({
      where: allowedIds ? { id: { in: allowedIds } } : undefined,
      orderBy: { name: "asc" },
    }),
    // Solo tiene sentido para un admin acotado: sus propias solicitudes de
    // alta de cliente pendientes de que el owner las resuelva.
    isOwner
      ? Promise.resolve([])
      : prisma.clientRequest.findMany({
          where: { requestedById: session.id, status: "pending" },
          orderBy: { createdAt: "desc" },
        }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-10 py-11">
      <div className="mb-7">
        <h1 className="mb-1.5 text-[32px] font-bold tracking-tight font-display">Tus clientes</h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {clients.length} {clients.length === 1 ? "cuenta activa" : "cuentas activas"} · gestionalas todas desde acá
        </p>
      </div>

      <NewClientForm />

      {myRequests.length > 0 && (
        <MyClientRequests requests={myRequests.map((r) => ({ id: r.id, name: r.name }))} />
      )}

      {clients.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {isOwner
            ? "Todavía no hay clientes cargados. Agregá el primero arriba."
            : "Todavía no tenés ningún cliente asignado — pedile al owner que te dé acceso."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client, i) => (
            <ClientRow key={client.id} client={client} index={i} canDelete={isOwner} />
          ))}
        </ul>
      )}
    </div>
  );
}
