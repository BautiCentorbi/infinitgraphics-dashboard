"use client";

import { useActionState, useRef } from "react";
import { createNote, type NoteFormState } from "./actions";

const initialState: NoteFormState = { error: null };
const inputCls = "rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

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
      <input name="title" placeholder="Título de la nota" required className={inputCls} style={{ borderColor: "var(--border)" }} />
      <textarea name="body" placeholder="Contenido..." rows={3} className={inputCls} style={{ borderColor: "var(--border)" }} />
      <button type="submit" disabled={pending} className="btn-grad self-start">
        {pending ? "Agregando..." : "Agregar nota"}
      </button>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
