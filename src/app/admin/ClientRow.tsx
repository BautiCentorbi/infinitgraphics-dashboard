"use client";

import Link from "next/link";
import { useState } from "react";
import { renameClient, deleteClient } from "./actions";

// Ciclo de gradientes de marca para los avatares — variedad visual sin
// depender de datos reales de plataformas conectadas (eso es el pilar de
// analytics, todavía no construido).
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, var(--sky), var(--blue))",
  "linear-gradient(135deg, var(--amber), var(--blue))",
  "linear-gradient(135deg, var(--teal), var(--sky))",
  "linear-gradient(135deg, var(--blue), var(--amber))",
  "linear-gradient(135deg, var(--sky), var(--amber))",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ClientRow({
  client,
  index,
}: {
  client: { id: string; name: string; slug: string };
  index: number;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (editing) {
    return (
      <li className="surface card-anim rounded-[18px] p-5">
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
            className="flex-1 rounded-lg border bg-black/20 px-2.5 py-1.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          <button type="submit" className="text-sm font-semibold underline">
            Guardar
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-sm" style={{ color: "var(--text-faint)" }}>
            Cancelar
          </button>
        </form>
      </li>
    );
  }

  return (
    <li
      className="surface surface-hover card-anim group relative overflow-hidden rounded-[18px] p-5"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex h-11.5 w-11.5 items-center justify-center rounded-[13px] font-display text-base font-bold text-white"
          style={{ background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] }}
        >
          {initials(client.name)}
        </div>
        <div className="flex items-center gap-3 text-xs opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => setEditing(true)} style={{ color: "var(--text-dim)" }}>
            Renombrar
          </button>
          {confirmingDelete ? (
            <form action={deleteClient} className="flex items-center gap-1.5">
              <input type="hidden" name="id" value={client.id} />
              <span className="text-red-400">¿Borrar?</span>
              <button type="submit" className="font-semibold text-red-400 underline">
                Sí
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)} style={{ color: "var(--text-faint)" }}>
                No
              </button>
            </form>
          ) : (
            <button onClick={() => setConfirmingDelete(true)} style={{ color: "var(--text-dim)" }}>
              Borrar
            </button>
          )}
        </div>
      </div>

      <Link href={`/admin/${client.slug}`} className="block">
        <h3 className="mb-0.5 text-[16px] font-bold" style={{ color: "var(--text)" }}>
          {client.name}
        </h3>
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          Abrir workspace →
        </p>
      </Link>
    </li>
  );
}
