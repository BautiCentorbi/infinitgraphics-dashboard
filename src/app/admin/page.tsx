import { prisma } from "@/lib/prisma";
import { signOutAction } from "./actions";
import { NewClientForm } from "./NewClientForm";
import { ClientRow } from "./ClientRow";

// Siempre dinámico: lee la lista de clientes en vivo, no tiene sentido
// prerenderizarla estáticamente (y el build fallaría sin DB disponible).
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <form action={signOutAction}>
          <button type="submit" className="text-sm underline">
            Salir
          </button>
        </form>
      </div>

      <NewClientForm />

      {clients.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          Todavía no hay clientes cargados. Agregá el primero arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((client) => (
            <ClientRow key={client.id} client={client} />
          ))}
        </ul>
      )}
    </div>
  );
}
