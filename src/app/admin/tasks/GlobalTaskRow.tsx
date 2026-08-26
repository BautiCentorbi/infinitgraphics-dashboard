"use client";

import Link from "next/link";
import { PriorityPicker } from "@/app/admin/[slug]/PriorityPicker";
import { TaskStatusPicker } from "@/app/admin/[slug]/TaskStatusPicker";
import { AVATAR_GRADIENTS, initials } from "@/lib/avatar";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

export type GlobalTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  client: { id: string; name: string; slug: string; avatarUrl: string | null };
};

// Fila de tarea para la vista global (/admin/tasks) — mismo patrón que
// TaskItem (admin/[slug]/TaskItem.tsx) pero con el cliente visible, ya que
// acá conviven tareas de todos los clientes.
export function GlobalTaskRow({
  task,
  onStatusChange,
  onPriorityChange,
  onDelete,
}: {
  task: GlobalTask;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onDelete: () => void;
}) {
  return (
    <li className="surface group flex items-center justify-between gap-2 rounded-[12px] px-3.5 py-2.5 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <Link
          href={`/admin/${task.client.slug}#tareas`}
          className="flex shrink-0 items-center gap-1.5 rounded-full py-0.5 pr-2 pl-0.5 text-xs font-semibold transition-colors hover:bg-[var(--surface-2)]"
          title={task.client.name}
        >
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[6px] text-[9px] font-bold text-white"
            style={{ background: task.client.avatarUrl ? undefined : AVATAR_GRADIENTS[task.client.slug.length % AVATAR_GRADIENTS.length] }}
          >
            {task.client.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={task.client.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(task.client.name)
            )}
          </span>
          <span className="max-w-[120px] truncate" style={{ color: "var(--text-dim)" }}>
            {task.client.name}
          </span>
        </Link>
        <TaskStatusPicker value={task.status} onChange={onStatusChange} />
        <span className="text-sm" style={task.status === "done" ? { color: "var(--text-faint)", textDecoration: "line-through" } : undefined}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className="shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>
            {new Date(task.dueDate).toLocaleDateString("es-AR")}
          </span>
        )}
        <PriorityPicker value={task.priority} onChange={onPriorityChange} />
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="text-sm opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: "var(--text-dim)" }}
      >
        Borrar
      </button>
    </li>
  );
}
