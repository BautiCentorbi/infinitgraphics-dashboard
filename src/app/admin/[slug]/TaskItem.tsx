"use client";

import { toggleTask, deleteTask } from "./actions";

export function TaskItem({
  task,
  slug,
}: {
  task: { id: string; title: string; done: boolean; dueDate: Date | null };
  slug: string;
}) {
  return (
    <li className="surface flex items-center justify-between gap-2 rounded-[12px] px-3.5 py-2.5">
      <form action={toggleTask} className="flex flex-1 items-center gap-2.5">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="done" value={String(task.done)} />
        <button type="submit" aria-label="Marcar como hecha" className="shrink-0">
          <span
            className="flex h-4 w-4 items-center justify-center rounded"
            style={
              task.done
                ? { background: "var(--grad)" }
                : { border: "1.5px solid var(--border-strong)" }
            }
          >
            {task.done && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                <path d="M4 12l6 6L20 6" />
              </svg>
            )}
          </span>
        </button>
        <span className="text-sm" style={task.done ? { color: "var(--text-faint)", textDecoration: "line-through" } : undefined}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            {new Date(task.dueDate).toLocaleDateString("es-AR")}
          </span>
        )}
      </form>
      <form action={deleteTask}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="slug" value={slug} />
        <button type="submit" className="text-sm" style={{ color: "var(--text-dim)" }}>
          Borrar
        </button>
      </form>
    </li>
  );
}
