import { prisma } from "@/lib/prisma";
import { NewClientForm } from "./NewClientForm";
import { ClientRow } from "./ClientRow";

// Siempre dinámico: lee la lista de clientes en vivo, no tiene sentido
// prerenderizarla estáticamente (y el build fallaría sin DB disponible).
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-5xl px-10 py-11">
      <div className="mb-7">
        <h1 className="mb-1.5 text-[32px] font-bold tracking-tight font-display">Tus clientes</h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {clients.length} {clients.length === 1 ? "cuenta activa" : "cuentas activas"} · gestionalas todas desde acá
        </p>
      </div>

      <NewClientForm />

      {clients.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Todavía no hay clientes cargados. Agregá el primero arriba.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client, i) => (
            <ClientRow key={client.id} client={client} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
