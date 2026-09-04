import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientCalendarApp } from "@/app/c/[slug]/ClientCalendarApp";
import type { ClientPiece } from "@/app/c/[slug]/types";

export const dynamic = "force-dynamic";

// Link público de solo lectura — sin login, protegido únicamente por lo
// impredecible del token (ver Client.shareToken, src/lib/shareToken.ts).
// A propósito NO pasa por src/proxy.ts (el matcher solo cubre /admin y /c,
// ver ese archivo) — esta ruta es pública por diseño. Mismas 3 vistas que
// /c/[slug], pero interactive=false: sin comentar ni aprobar/pedir cambios
// (eso sigue necesitando el login real). Ver CLAUDE.md, "Vista de solo
// lectura por link" (2026-09-04).
export default async function SharedCalendarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await prisma.client.findUnique({ where: { shareToken: token } });
  if (!client) notFound();

  // Mismo criterio que el login de cliente: "draft" es trabajo interno del
  // CM todavía no compartido — un link público es aún menos confiable que
  // un login, no debería ver menos que eso.
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
        <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}>
          Vista de solo lectura
        </span>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-9">
        <h1 className="mb-1.5 text-2xl font-bold tracking-tight font-display">Calendario — {client.name}</h1>
        <p className="mb-7 text-sm" style={{ color: "var(--text-dim)" }}>
          Compartido como link de solo lectura — para comentar o aprobar piezas hace falta un login de cliente.
        </p>
        <ClientCalendarApp slug={client.slug} initialPieces={serialized} interactive={false} />
      </div>
    </div>
  );
}
