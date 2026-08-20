"use client";

import { useActionState, useRef } from "react";
import { createNote, type NoteFormState } from "./actions";

const initialState: NoteFormState = { error: null };

export function NewNoteForm({ clientId, slug }: { clientId: string; slug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: NoteFormState, fd: FormData) => {
    const result = await createNote(prev, fd);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="mb-4 flex flex-col gap-2">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="slug" value={slug} />
      <input
        name="title"
        placeholder="Título de la nota"
        required
        className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
      />
      <textarea
        name="body"
        placeholder="Contenido..."
        rows={3}
        className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Agregando..." : "Agregar nota"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
