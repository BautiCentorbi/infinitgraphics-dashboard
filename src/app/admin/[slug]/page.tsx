import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewNoteForm } from "./NewNoteForm";
import { NoteItem } from "./NoteItem";
import { NewTaskForm } from "./NewTaskForm";
import { TaskItem } from "./TaskItem";

export const dynamic = "force-dynamic";

export default async function ClientWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await prisma.client.findUnique({ where: { slug } });
  if (!client) notFound();

  const [notes, tasks] = await Promise.all([
    prisma.note.findMany({ where: { clientId: client.id }, orderBy: { updatedAt: "desc" } }),
    prisma.task.findMany({ where: { clientId: client.id }, orderBy: [{ done: "asc" }, { dueDate: "asc" }] }),
  ]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/admin" className="text-sm text-black/60 hover:underline dark:text-white/60">
        ← Clientes
      </Link>
      <h1 className="mt-2 mb-6 text-lg font-semibold">{client.name}</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Tareas
        </h2>
        <NewTaskForm clientId={client.id} slug={client.slug} />
        {tasks.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">Sin tareas todavía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} slug={client.slug} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Notas
        </h2>
        <NewNoteForm clientId={client.id} slug={client.slug} />
        {notes.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">Sin notas todavía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} slug={client.slug} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs text-black/40 dark:text-white/40">
        Calendario de contenido: próximo paso (ver ARCHITECTURE.md).
      </p>
    </div>
  );
}
