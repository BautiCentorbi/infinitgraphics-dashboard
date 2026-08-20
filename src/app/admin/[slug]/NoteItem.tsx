"use client";

import { useState } from "react";
import { updateNote, deleteNote } from "./actions";

export function NoteItem({
  note,
  slug,
}: {
  note: { id: string; title: string; body: string };
  slug: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="surface rounded-[14px] p-3.5">
        <form
          action={async (formData) => {
            await updateNote(formData);
            setEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="id" value={note.id} />
          <input type="hidden" name="slug" value={slug} />
          <input
            name="title"
            defaultValue={note.title}
            autoFocus
            className="rounded-[9px] border bg-black/20 px-2.5 py-1.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          <textarea
            name="body"
            defaultValue={note.body}
            rows={3}
            className="rounded-[9px] border bg-black/20 px-2.5 py-1.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          <div className="flex gap-3 text-sm">
            <button type="submit" className="font-semibold underline">
              Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{ color: "var(--text-faint)" }}>
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="surface surface-hover card-anim group rounded-[14px] p-3.5 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{note.title}</p>
          {note.body && (
            <p className="mt-1 text-sm break-words whitespace-pre-wrap" style={{ color: "var(--text-dim)" }}>
              {note.body}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2.5 text-sm opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => setEditing(true)} style={{ color: "var(--text-dim)" }}>
            Editar
          </button>
          <form action={deleteNote}>
            <input type="hidden" name="id" value={note.id} />
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" style={{ color: "var(--text-dim)" }}>
              Borrar
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
