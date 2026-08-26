"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { TaskItem } from "./TaskItem";
import { TaskKanban } from "./TaskKanban";
import { setTaskStatus, deleteTask } from "./actions";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/content";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

export type TaskFull = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: Date | null;
  priority: TaskPriority;
};

type View = "list" | "kanban";

// Envuelve la lista de tareas de un cliente con tabs Lista/Kanban (mismo
// patrón que CalendarApp para ContentPiece) + filtro por prioridad. El
// kanban tiene 3 columnas fijas (pending/in_progress/done, ver TaskStatus).
export function TaskBoard({ tasks, slug }: { tasks: TaskFull[]; slug: string }) {
  const router = useRouter();
  const [view, setView] = useState<View>("list");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  const filtered = priorityFilter === "all" ? tasks : tasks.filter((t) => t.priority === priorityFilter);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("task-status:")) return;

    const status = overId.replace("task-status:", "") as TaskStatus;
    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    await setTaskStatus(taskId, slug, status);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteTask(id, slug);
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {tasks.length === 0 ? "Sin tareas todavía." : "Ninguna tarea con esa prioridad."}
        </p>
      ) : view === "list" ? (
        <motion.ul key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="flex flex-col gap-2">
          {filtered.map((task) => (
            <TaskItem key={task.id} task={task} slug={slug} />
          ))}
        </motion.ul>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <motion.div key="kanban" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <TaskKanban
              tasks={filtered.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate ? t.dueDate.toISOString() : null }))}
              onDelete={handleDelete}
            />
          </motion.div>
        </DndContext>
      )}
    </div>
  );
}
