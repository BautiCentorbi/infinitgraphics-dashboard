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
    <div className="bg-app min-h-screen">
      <div className="flex items-center justify-between border-b px-10 py-4.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[9px]"
            style={{ background: "var(--grad)", boxShadow: "0 6px 18px -4px var(--grad-shadow)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
              <rect x="3" y="4" width="18" height="17" rx="3" />
              <path d="M8 2v4M16 2v4M3 10h18" />
              <circle cx="9" cy="15" r="1.2" fill="white" stroke="none" />
              <circle cx="15" cy="15" r="1.2" fill="white" stroke="none" />
            </svg>
          </div>
          <span className="font-display text-[17px] font-bold">cm-suite</span>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="text-sm underline" style={{ color: "var(--text-dim)" }}>
            Salir
          </button>
        </form>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-9">
        <h1 className="mb-7 text-2xl font-bold tracking-tight font-display">Calendario — {client.name}</h1>
        <ClientCalendar slug={slug} initialPieces={serialized} />
      </div>
    </div>
  );
}
