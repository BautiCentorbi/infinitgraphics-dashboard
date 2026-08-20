"use client";

import { useActionState, useRef, useState } from "react";
import { createClientUser, deleteClientUser, type ClientUserFormState } from "./actions";

const initialState: ClientUserFormState = { error: null };

export function ClientAccess({
  clientId,
  slug,
  users,
}: {
  clientId: string;
  slug: string;
  users: { id: string; email: string }[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: ClientUserFormState, fd: FormData) => {
    const result = await createClientUser(prev, fd);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <section className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50"
      >
        Acceso del cliente {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="flex flex-col gap-3">
          {users.length > 0 && (
            <ul className="flex flex-col gap-1">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded border border-black/10 px-3 py-2 text-sm dark:border-white/10"
                >
                  <span>{u.email}</span>
                  <form action={deleteClientUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" className="text-black/60 dark:text-white/60">
                      Borrar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          {users.length === 0 && (
            <p className="text-sm text-black/60 dark:text-white/60">
              Este cliente todavía no tiene login — creá uno para que pueda ver su
              calendario en /c/{slug}.
            </p>
          )}

          <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="clientId" value={clientId} />
            <input type="hidden" name="slug" value={slug} />
            <input
              name="email"
              type="email"
              placeholder="email del cliente"
              required
              className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <input
              name="password"
              type="text"
              placeholder="contraseña (mín. 8 caracteres)"
              required
              minLength={8}
              className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {pending ? "Creando..." : "Crear acceso"}
            </button>
          </form>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </div>
      )}
    </section>
  );
}
