import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarApp } from "./CalendarApp";
import { AdminNav } from "@/components/AdminNav";
import type { Piece } from "./types";

export const dynamic = "force-dynamic";

export default async function ClientCalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  const [pieces, topics] = await Promise.all([
    prisma.contentPiece.findMany({
      where: { clientId: client.id },
      include: {
        topic: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { email: true, role: true } } },
        },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.topic.findMany({ where: { clientId: client.id }, orderBy: { name: "asc" } }),
  ]);

  const serializedPieces: Piece[] = pieces.map((p) => ({
    id: p.id,
    title: p.title,
    platform: p.platform,
    scheduledDate: p.scheduledDate.toISOString(),
    copy: p.copy,
    hashtags: p.hashtags,
    mediaUrl: p.mediaUrl,
    status: p.status,
    topicId: p.topicId,
    topic: p.topic,
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
      <AdminNav active="calendario" calendarSlug={client.slug} />

      <div className="mx-auto max-w-6xl px-10 py-9">
        <Link href={`/admin/${slug}`} className="text-sm hover:underline" style={{ color: "var(--text-dim)" }}>
          ← {client.name}
        </Link>
        <h1 className="mt-2 mb-6 text-[26px] font-bold tracking-tight font-display">
          Calendario de contenido — {client.name}
        </h1>

        <CalendarApp
          clientId={client.id}
          slug={client.slug}
          initialPieces={serializedPieces}
          initialTopics={topics}
        />
      </div>
    </div>
  );
}
