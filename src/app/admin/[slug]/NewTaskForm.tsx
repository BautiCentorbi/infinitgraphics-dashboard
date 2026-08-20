"use client";

import { useActionState, useRef } from "react";
import { createTask, type TaskFormState } from "./actions";

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
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="Nueva tarea"
          required
          className={`flex-1 ${inputCls}`}
          style={{ borderColor: "var(--border)" }}
        />
        <input name="dueDate" type="date" className={inputCls} style={{ borderColor: "var(--border)", colorScheme: "dark" }} />
        <button type="submit" disabled={pending} className="btn-grad">
          {pending ? "..." : "Agregar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
