import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientCalendar } from "./ClientCalendar";
import { signOutAction } from "./actions";
import type { ClientPiece } from "./types";

export const dynamic = "force-dynamic";

export default async function ClientCalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  // Piezas en "draft" son trabajo interno del CM, todavía no compartido —
  // el cliente solo ve desde que pasa a revisión en adelante.
  const pieces = await prisma.contentPiece.findMany({
    where: { clientId: client.id, status: { not: "draft" } },
    include: {
      topic: { select: { name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { email: true, role: true } } },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  const serialized: ClientPiece[] = pieces.map((p) => ({
    id: p.id,
    title: p.title,
    platform: p.platform,
    scheduledDate: p.scheduledDate.toISOString(),
    copy: p.copy,
    hashtags: p.hashtags,
    mediaUrl: p.mediaUrl,
    status: p.status,
    topicName: p.topic?.name ?? null,
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      authorEmail: c.author.email,
      authorRole: c.author.role,
    })),
  }));

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Calendario — {client.name}</h1>
        <form action={signOutAction}>
          <button type="submit" className="text-sm underline">
            Salir
          </button>
        </form>
      </div>

      <ClientCalendar slug={slug} initialPieces={serialized} />
    </div>
  );
}
