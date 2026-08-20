"use client";

import { useActionState, useRef } from "react";
import { createTask, type TaskFormState } from "./actions";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/content";

const initialState: TaskFormState = { error: null };
const inputCls = "rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

export function NewTaskForm({ clientId, slug }: { clientId: string; slug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: TaskFormState, fd: FormData) => {
    const result = await createTask(prev, fd);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="mb-4 flex flex-col gap-2">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="slug" value={slug} />
      <input
        name="title"
        placeholder="Nueva tarea"
        required
        className={`w-full ${inputCls}`}
        style={{ borderColor: "var(--border)" }}
      />
      <div className="flex flex-wrap gap-2">
        <input
          name="dueDate"
          type="date"
          className={`min-w-0 flex-1 ${inputCls}`}
          style={{ borderColor: "var(--border)", colorScheme: "dark" }}
        />
        <select name="priority" defaultValue="medium" className={inputCls} style={{ borderColor: "var(--border)" }}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="btn-grad shrink-0">
          {pending ? "..." : "Agregar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
