import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewNoteForm } from "./NewNoteForm";
import { NoteItem } from "./NoteItem";
import { NewTaskForm } from "./NewTaskForm";
import { TaskItem } from "./TaskItem";
import { ClientAccess } from "./ClientAccess";
import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function ClientWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  const [notes, tasks, clientUsers] = await Promise.all([
    prisma.note.findMany({ where: { clientId: client.id }, orderBy: { updatedAt: "desc" } }),
    prisma.task.findMany({ where: { clientId: client.id }, orderBy: [{ done: "asc" }, { dueDate: "asc" }] }),
    prisma.user.findMany({ where: { clientId: client.id, role: "client" }, select: { id: true, email: true } }),
  ]);

  return (
    <div className="bg-app min-h-screen">
      <AdminNav active="clientes" calendarSlug={client.slug} />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/admin" className="text-sm hover:underline" style={{ color: "var(--text-dim)" }}>
          ← Clientes
        </Link>
        <div className="mt-2 mb-7 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight font-display">{client.name}</h1>
          <Link href={`/admin/${client.slug}/calendar`} className="btn-grad">
            Calendario de contenido →
          </Link>
        </div>

        <ClientAccess clientId={client.id} slug={client.slug} users={clientUsers} />

        <section className="mb-8">
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

        <section>
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
  );
}
