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
    <li className="flex items-center justify-between gap-2 rounded border border-black/10 px-3 py-2 dark:border-white/10">
      <form action={toggleTask} className="flex flex-1 items-center gap-2">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="done" value={String(task.done)} />
        <button type="submit" aria-label="Marcar como hecha" className="shrink-0">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              task.done ? "border-black bg-black dark:border-white dark:bg-white" : "border-black/40 dark:border-white/40"
            }`}
          >
            {task.done && <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />}
          </span>
        </button>
        <span className={`text-sm ${task.done ? "text-black/40 line-through dark:text-white/40" : ""}`}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className="text-xs text-black/50 dark:text-white/50">
            {new Date(task.dueDate).toLocaleDateString("es-AR")}
          </span>
        )}
      </form>
      <form action={deleteTask}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="slug" value={slug} />
        <button type="submit" className="text-sm text-black/60 dark:text-white/60">
          Borrar
        </button>
      </form>
    </li>
  );
}
