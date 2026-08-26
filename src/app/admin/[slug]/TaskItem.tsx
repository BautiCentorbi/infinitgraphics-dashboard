"use client";

import { useRouter } from "next/navigation";
import { deleteTask, setTaskPriority, setTaskStatus } from "./actions";
import { PriorityPicker } from "./PriorityPicker";
import { TaskStatusPicker } from "./TaskStatusPicker";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

export function TaskItem({
  task,
  slug,
}: {
  task: { id: string; title: string; status: TaskStatus; dueDate: Date | null; priority: TaskPriority };
  slug: string;
}) {
  const router = useRouter();

  async function handlePriorityChange(priority: TaskPriority) {
    await setTaskPriority(task.id, slug, priority);
    router.refresh();
  }

  async function handleStatusChange(status: TaskStatus) {
    await setTaskStatus(task.id, slug, status);
    router.refresh();
  }

  async function handleDelete() {
    await deleteTask(task.id, slug);
    router.refresh();
  }

  return (
    <li className="surface group flex items-center justify-between gap-2 rounded-[12px] px-3.5 py-2.5 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <TaskStatusPicker value={task.status} onChange={handleStatusChange} />
        <span className="text-sm" style={task.status === "done" ? { color: "var(--text-faint)", textDecoration: "line-through" } : undefined}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className="shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>
            {new Date(task.dueDate).toLocaleDateString("es-AR")}
          </span>
        )}
        <PriorityPicker value={task.priority} onChange={handlePriorityChange} />
      </div>
      <button
        type="button"
        onClick={handleDelete}
        className="text-sm opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: "var(--text-dim)" }}
      >
        Borrar
      </button>
    </li>
  );
}
