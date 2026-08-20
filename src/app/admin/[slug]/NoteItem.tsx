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
      <li className="rounded border border-black/10 p-3 dark:border-white/10">
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
            className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
          />
          <textarea
            name="body"
            defaultValue={note.body}
            rows={3}
            className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
          />
          <div className="flex gap-3 text-sm">
            <button type="submit" className="underline">
              Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-black/50 dark:text-white/50">
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded border border-black/10 p-3 dark:border-white/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{note.title}</p>
          {note.body && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-black/70 dark:text-white/70">
              {note.body}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2 text-sm">
          <button onClick={() => setEditing(true)} className="text-black/60 dark:text-white/60">
            Editar
          </button>
          <form action={deleteNote}>
            <input type="hidden" name="id" value={note.id} />
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" className="text-black/60 dark:text-white/60">
              Borrar
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
