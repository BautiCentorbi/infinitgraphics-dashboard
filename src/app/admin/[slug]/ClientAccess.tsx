"use client";

import { useActionState, useRef, useState } from "react";
import { createClientUser, deleteClientUser, type ClientUserFormState } from "./actions";

const initialState: ClientUserFormState = { error: null };
const inputCls = "min-w-0 flex-1 rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

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
        className="mb-3 text-xs font-bold tracking-wide uppercase"
        style={{ color: "var(--text-faint)" }}
      >
        Acceso del cliente {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="flex flex-col gap-3">
          {users.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {users.map((u) => (
                <li key={u.id} className="surface flex items-center justify-between rounded-[12px] px-3.5 py-2.5 text-sm">
                  <span>{u.email}</span>
                  <form action={deleteClientUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" style={{ color: "var(--text-dim)" }}>
                      Borrar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          {users.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
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
              className={inputCls}
              style={{ borderColor: "var(--border)" }}
            />
            <input
              name="password"
              type="text"
              placeholder="contraseña (mín. 8 caracteres)"
              required
              minLength={8}
              className={inputCls}
              style={{ borderColor: "var(--border)" }}
            />
            <button type="submit" disabled={pending} className="btn-grad">
              {pending ? "Creando..." : "Crear acceso"}
            </button>
          </form>
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        </div>
      )}
    </section>
  );
}
