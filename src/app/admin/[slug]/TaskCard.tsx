"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { PRIORITY_LABELS, PRIORITY_COLOR } from "@/lib/content";
import { AVATAR_GRADIENTS, initials } from "@/lib/avatar";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

export type TaskCardData = {
  id: string;
  title: string;
  dueDate: string | null; // ISO
  priority: TaskPriority;
  status: TaskStatus;
  // Solo presente en la vista global (/admin/tasks) — en la vista por
  // cliente el client ya está implícito en la página.
  client?: { name: string; slug: string; avatarUrl: string | null };
};

// Tarjeta arrastrable del kanban de tareas — mismo patrón que PieceCard
// (calendar/PieceCard.tsx) para ContentPiece, pero mucho más chica (una
// tarea no tiene tanto campo).
export function TaskCard({ task, onDelete }: { task: TaskCardData; onDelete?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const style: CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined),
    ...(isDragging ? { zIndex: 10, opacity: 0.5 } : undefined),
  };

  const overdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="surface group relative w-full cursor-grab rounded-[10px] px-2.5 py-2 text-left text-xs transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
    >
      <p className="pr-4 font-semibold">{task.title}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold"
          style={{ background: "var(--surface-2)", color: PRIORITY_COLOR[task.priority as TaskPriority] }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[task.priority as TaskPriority] }} />
          {PRIORITY_LABELS[task.priority as TaskPriority]}
        </span>
        {task.dueDate && (
          <span className="text-[10.5px]" style={{ color: overdue ? "var(--amber)" : "var(--text-faint)" }}>
            {new Date(task.dueDate).toLocaleDateString("es-AR")}
          </span>
        )}
        {task.client && (
          <span className="ml-auto flex items-center gap-1" title={task.client.name}>
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-[4px] text-[8px] font-bold text-white"
              style={{ background: task.client.avatarUrl ? undefined : AVATAR_GRADIENTS[task.client.slug.length % AVATAR_GRADIENTS.length] }}
            >
              {task.client.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={task.client.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(task.client.name)
              )}
            </span>
          </span>
        )}
      </div>
      {onDelete && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1.5 right-1.5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: "var(--text-faint)" }}
          aria-label="Borrar tarea"
        >
          ✕
        </button>
      )}
    </div>
  );
}
