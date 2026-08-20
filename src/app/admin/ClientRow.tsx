"use client";

import Link from "next/link";
import { useState } from "react";
import { renameClient, deleteClient } from "./actions";

export function ClientRow({
  client,
}: {
  client: { id: string; name: string; slug: string };
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li className="rounded border border-black/10 px-4 py-3 dark:border-white/10">
      {editing ? (
        <form
          action={async (formData) => {
            await renameClient(formData);
            setEditing(false);
          }}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="id" value={client.id} />
          <input
            name="name"
            defaultValue={client.name}
            autoFocus
            className="flex-1 rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
          />
          <button type="submit" className="text-sm underline">
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-black/50 dark:text-white/50"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <Link href={`/admin/${client.slug}`} className="hover:underline">
            {client.name}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => setEditing(true)} className="text-black/60 dark:text-white/60">
              Renombrar
            </button>
            {confirmingDelete ? (
              <form
                action={deleteClient}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="id" value={client.id} />
                <span className="text-red-600">¿Borrar?</span>
                <button type="submit" className="text-red-600 underline">
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-black/50 dark:text-white/50"
                >
                  No
                </button>
              </form>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="text-black/60 dark:text-white/60"
              >
                Borrar
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
