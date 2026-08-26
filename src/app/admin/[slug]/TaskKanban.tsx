"use client";

import { useDroppable } from "@dnd-kit/core";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/content";
import { TaskCard, type TaskCardData } from "./TaskCard";
import type { TaskStatus } from "@/generated/prisma/enums";

function TaskKanbanColumn({
  status,
  tasks,
  onDelete,
}: {
  status: TaskStatus;
  tasks: TaskCardData[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `task-status:${status}` });

  return (
    <div
      ref={setNodeRef}
      className="flex w-60 shrink-0 flex-col gap-2 rounded-[13px] border p-2.5 transition-colors"
      style={{ borderColor: "var(--border)", background: isOver ? "var(--surface-2)" : "transparent" }}
    >
      <div className="flex items-center justify-between px-0.5 pb-0.5">
        <span className="text-[12px] font-bold tracking-wide uppercase" style={{ color: "var(--text-dim)" }}>
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "var(--surface)", color: "var(--text-faint)" }}>
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onDelete={() => onDelete(t.id)} />
        ))}
        {tasks.length === 0 && (
          <p className="px-0.5 py-2 text-[11px]" style={{ color: "var(--text-faint)" }}>
            Sin tareas
          </p>
        )}
      </div>
    </div>
  );
}

// Kanban de tareas — 3 columnas fijas (pending/in_progress/done, ver
// TaskStatus en el schema). Dentro de cada columna, ordenado por prioridad
// (alta primero) — ya viene ordenado así desde el server.
export function TaskKanban({ tasks, onDelete }: { tasks: TaskCardData[]; onDelete: (id: string) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {TASK_STATUSES.map((status) => (
        <TaskKanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
