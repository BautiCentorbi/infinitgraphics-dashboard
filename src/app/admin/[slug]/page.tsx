import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewNoteForm } from "./NewNoteForm";
import { NoteItem } from "./NoteItem";
import { NewTaskForm } from "./NewTaskForm";
import { TaskItem } from "./TaskItem";
import { ClientAccess } from "./ClientAccess";
import { DocumentsSection } from "./DocumentsSection";
import { StatTiles } from "./StatTiles";
import { CalendarPreview } from "./CalendarPreview";
import { ClientAvatarUpload } from "./ClientAvatarUpload";

export const dynamic = "force-dynamic";

export default async function ClientWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  const [notes, tasks, clientUsers, documents, upcomingPieces, totalPieces, pendingReview] = await Promise.all([
    prisma.note.findMany({ where: { clientId: client.id }, orderBy: { updatedAt: "desc" } }),
    prisma.task.findMany({ where: { clientId: client.id }, orderBy: [{ done: "asc" }, { dueDate: "asc" }] }),
    prisma.user.findMany({ where: { clientId: client.id, role: "client" }, select: { id: true, email: true } }),
    prisma.document.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" } }),
    prisma.contentPiece.findMany({
      where: { clientId: client.id, scheduledDate: { gte: new Date() } },
      orderBy: { scheduledDate: "asc" },
      take: 5,
      select: { id: true, title: true, platform: true, status: true, scheduledDate: true },
    }),
    prisma.contentPiece.count({ where: { clientId: client.id } }),
    prisma.contentPiece.count({ where: { clientId: client.id, status: "in_review" } }),
  ]);

  const pendingTasks = tasks.filter((t) => !t.done).length;

  return (
    <div className="mx-auto max-w-6xl px-10 py-9">
      <Link href="/admin" className="text-sm hover:underline" style={{ color: "var(--text-dim)" }}>
        ← Clientes
      </Link>
      <div className="mt-2 mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <ClientAvatarUpload
            clientId={client.id}
            name={client.name}
            avatarUrl={client.avatarUrl}
            colorIndex={client.slug.length}
          />
          <h1 className="text-2xl font-bold tracking-tight font-display">{client.name}</h1>
        </div>
        <Link href={`/admin/${client.slug}/calendar`} className="btn-grad">
          Calendario de contenido →
        </Link>
      </div>

      <StatTiles
        totalPieces={totalPieces}
        pendingReview={pendingReview}
        pendingTasks={pendingTasks}
        totalDocs={documents.length}
      />

      <ClientAccess clientId={client.id} slug={client.slug} users={clientUsers} />

      <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
        <div>
          <CalendarPreview slug={client.slug} pieces={upcomingPieces} />

          <section id="tareas" className="mb-8 scroll-mt-6">
            <h2 className="mb-3 text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
              Tareas
            </h2>
            <NewTaskForm clientId={client.id} slug={client.slug} />
            {tasks.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>Sin tareas todavía.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} slug={client.slug} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div>
          <div id="documentacion" className="scroll-mt-6">
            <DocumentsSection
              clientId={client.id}
              slug={client.slug}
              documents={documents.map((d) => ({
                id: d.id,
                title: d.title,
                description: d.description,
                fileUrl: d.fileUrl,
                fileName: d.fileName,
                fileSize: d.fileSize,
                mimeType: d.mimeType,
                createdAt: d.createdAt.toISOString(),
              }))}
            />
          </div>

          <section id="notas" className="scroll-mt-6">
            <h2 className="mb-3 text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
              Notas
            </h2>
            <NewNoteForm clientId={client.id} slug={client.slug} />
            {notes.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>Sin notas todavía.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {notes.map((note) => (
                  <NoteItem key={note.id} note={note} slug={client.slug} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
