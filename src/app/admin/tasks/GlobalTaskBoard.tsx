"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { GlobalTaskRow, type GlobalTask } from "./GlobalTaskRow";
import { TaskKanban } from "@/app/admin/[slug]/TaskKanban";
import { setTaskStatus, setTaskPriority, deleteTask } from "@/app/admin/[slug]/actions";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/content";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

type View = "list" | "kanban";

// Vista global de tareas (/admin/tasks) — mismo patrón de tabs Lista/Kanban
// + filtro que TaskBoard (admin/[slug]/TaskBoard.tsx), pero agregando todos
// los clientes y con filtro extra por cliente. Las acciones (setTaskStatus/
// setTaskPriority/deleteTask) son las mismas que usa el workspace por
// cliente — reciben el slug del cliente dueño de cada tarea para el
// revalidatePath correcto.
export function GlobalTaskBoard({ tasks }: { tasks: GlobalTask[] }) {
  const router = useRouter();
  const [view, setView] = useState<View>("list");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const clients = useMemo(() => {
    const map = new Map<string, GlobalTask["client"]>();
    for (const t of tasks) map.set(t.client.id, t.client);
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const filtered = tasks.filter(
    (t) => (priorityFilter === "all" || t.priority === priorityFilter) && (clientFilter === "all" || t.client.id === clientFilter)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("task-status:")) return;

    const status = overId.replace("task-status:", "") as TaskStatus;
    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    await setTaskStatus(taskId, task.client.slug, status);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await deleteTask(id, task.client.slug);
    router.refresh();
  }

  const tabs: { key: View; label: string }[] = [
    { key: "list", label: "Lista" },
    { key: "kanban", label: "Kanban" },
  ];
  const TAB_W = 88;
  const activeIdx = tabs.findIndex((t) => t.key === view);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="tabs">
          <div className="tab-indicator" style={{ width: TAB_W, transform: `translateX(${activeIdx * TAB_W}px)` }} />
          {tabs.map((t) => (
            <div
              key={t.key}
              className="tab"
              data-active={view === t.key}
              style={{ width: TAB_W, textAlign: "center" }}
              onClick={() => setView(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="select-field rounded-[10px] border border-[var(--border)] bg-black/20 px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="all">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
            className="select-field rounded-[10px] border border-[var(--border)] bg-black/20 px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="all">Toda prioridad</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {tasks.length === 0 ? "Sin tareas todavía en ningún cliente." : "Ninguna tarea con esos filtros."}
        </p>
      ) : view === "list" ? (
        <motion.ul key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="flex flex-col gap-2">
          {filtered.map((task) => (
            <GlobalTaskRow
              key={task.id}
              task={task}
              onStatusChange={async (status) => {
                await setTaskStatus(task.id, task.client.slug, status);
                router.refresh();
              }}
              onPriorityChange={async (priority) => {
                await setTaskPriority(task.id, task.client.slug, priority);
                router.refresh();
              }}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </motion.ul>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <motion.div key="kanban" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <TaskKanban
              tasks={filtered.map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                dueDate: t.dueDate ? t.dueDate.toISOString() : null,
                client: { name: t.client.name, slug: t.client.slug, avatarUrl: t.client.avatarUrl },
              }))}
              onDelete={handleDelete}
            />
          </motion.div>
        </DndContext>
      )}
    </div>
  );
}
