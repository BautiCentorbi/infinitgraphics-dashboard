import { prisma } from "@/lib/prisma";
import { GlobalTaskBoard } from "./GlobalTaskBoard";

export const dynamic = "force-dynamic";

export default async function GlobalTasksPage() {
  const tasks = await prisma.task.findMany({
    // status asc sigue el orden del enum (pending, in_progress, done).
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
    include: { client: { select: { id: true, name: true, slug: true, avatarUrl: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-10 py-9">
      <h1 className="mb-1 text-2xl font-bold tracking-tight font-display">Tareas</h1>
      <p className="mb-7 text-sm" style={{ color: "var(--text-dim)" }}>
        Todas las tareas de todos los clientes, en un solo lugar.
      </p>
      <GlobalTaskBoard tasks={tasks} />
    </div>
  );
}
