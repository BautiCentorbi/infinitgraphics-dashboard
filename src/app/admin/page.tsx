import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "./actions";

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

      {clients.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          Todavía no hay clientes cargados. (El CRUD para agregar clientes es
          el próximo paso — ver ARCHITECTURE.md, orden de implementación.)
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/admin/${client.slug}`}
                className="block rounded border border-black/10 px-4 py-3 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                {client.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
