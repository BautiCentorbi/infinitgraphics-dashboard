import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";

// Shell compartido por todo /admin/* — sidebar flotante con la lista de
// clientes (se expande al hover o se puede fijar abierto) + el fondo con
// blobs de marca. Solo del lado admin, nunca en /c/[slug].
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, avatarUrl: true },
  });

  return (
    <div className="bg-app min-h-screen">
      <Sidebar clients={clients} />
      <div style={{ paddingLeft: 92 }}>{children}</div>
    </div>
  );
}
