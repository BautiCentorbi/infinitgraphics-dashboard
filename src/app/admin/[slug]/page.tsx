import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/admin" className="text-sm text-black/60 hover:underline dark:text-white/60">
        ← Clientes
      </Link>
      <h1 className="mt-2 text-lg font-semibold">{client.name}</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Workspace (notas/tareas) y calendario de contenido van acá — próximo
        paso de implementación, ver ARCHITECTURE.md.
      </p>
    </div>
  );
}
