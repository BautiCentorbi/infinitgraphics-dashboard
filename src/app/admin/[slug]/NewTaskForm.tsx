"use client";

import { useActionState, useRef } from "react";
import { createTask, type TaskFormState } from "./actions";

const initialState: TaskFormState = { error: null };

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
          className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <input
          name="dueDate"
          type="date"
          className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "..." : "Agregar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
