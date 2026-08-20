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
      <button onClick={() => setOpen(!open)} className="font-semibold underline" style={{ color: "var(--text-dim)" }}>
        {open ? "Ocultar temas" : "Gestionar temas"}
      </button>
      {open && (
        <div className="surface mt-2 flex flex-col gap-2.5 rounded-[14px] p-3.5">
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <form
                key={t.id}
                action={deleteTopic}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "var(--surface-2)" }}
              >
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="slug" value={slug} />
                <span>{t.name}</span>
                <button type="submit" style={{ color: "var(--text-faint)" }}>
                  ✕
                </button>
              </form>
            ))}
            {topics.length === 0 && <span style={{ color: "var(--text-faint)" }}>Sin temas todavía.</span>}
          </div>
          <form ref={formRef} action={formAction} className="flex gap-2">
            <input type="hidden" name="clientId" value={clientId} />
            <input type="hidden" name="slug" value={slug} />
            <input
              name="name"
              placeholder="Nuevo tema (ej. Producto)"
              required
              className="flex-1 rounded-[10px] border bg-black/20 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--sky)]"
              style={{ borderColor: "var(--border)" }}
            />
            <button type="submit" disabled={pending} className="btn-grad px-3.5 py-1.5 text-xs">
              Agregar
            </button>
          </form>
          {state.error && <p className="text-red-400">{state.error}</p>}
        </div>
      )}
    </div>
  );
}
