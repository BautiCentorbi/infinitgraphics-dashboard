"use client";

import { useActionState, useRef, useState } from "react";
import { createTopic, deleteTopic, type PieceFormState } from "./actions";
import type { TopicOption } from "./types";

const initialState: PieceFormState = { error: null };

export function TopicManager({
  clientId,
  slug,
  topics,
}: {
  clientId: string;
  slug: string;
  topics: TopicOption[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: PieceFormState, fd: FormData) => {
    const result = await createTopic(prev, fd);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <div className="mb-4 text-sm">
      <button onClick={() => setOpen(!open)} className="text-black/60 underline dark:text-white/60">
        {open ? "Ocultar temas" : "Gestionar temas"}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2 rounded border border-black/10 p-3 dark:border-white/10">
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <form key={t.id} action={deleteTopic} className="flex items-center gap-1 rounded bg-black/5 px-2 py-1 dark:bg-white/10">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="slug" value={slug} />
                <span>{t.name}</span>
                <button type="submit" className="text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70">
                  ✕
                </button>
              </form>
            ))}
            {topics.length === 0 && <span className="text-black/50 dark:text-white/50">Sin temas todavía.</span>}
          </div>
          <form ref={formRef} action={formAction} className="flex gap-2">
            <input type="hidden" name="clientId" value={clientId} />
            <input type="hidden" name="slug" value={slug} />
            <input
              name="name"
              placeholder="Nuevo tema (ej. Producto)"
              required
              className="flex-1 rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
            <button type="submit" disabled={pending} className="rounded bg-black px-3 py-1 text-white disabled:opacity-50 dark:bg-white dark:text-black">
              Agregar
            </button>
          </form>
          {state.error && <p className="text-red-600">{state.error}</p>}
        </div>
      )}
    </div>
  );
}
