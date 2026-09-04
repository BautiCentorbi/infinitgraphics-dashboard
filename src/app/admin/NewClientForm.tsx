"use client";

import { useActionState } from "react";
import { createClient, type ClientFormState } from "./actions";

const initialState: ClientFormState = { error: null };

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClient, initialState);

  return (
    <form action={formAction} className="mb-7 flex flex-col gap-2">
      <div className="flex gap-2.5">
        <div className="surface flex flex-1 items-center gap-2.5 rounded-[11px] px-3.5 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 shrink-0">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <input
            name="name"
            placeholder="Nombre del cliente (ej. Cuenca del Sur)"
            required
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)]"
          />
        </div>
        <button type="submit" disabled={pending} className="btn-grad">
          {pending ? "Agregando..." : "Agregar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {/* Admin acotado sin permiso de alta directa (User.canCreateClients):
          no se creó, queda pendiente de que el owner lo apruebe (ver
          src/app/admin/actions.ts, createClient). */}
      {state.requested && (
        <p className="text-sm" style={{ color: "var(--amber)" }}>
          Solicitud enviada — le avisamos por mail al owner. Se crea cuando lo apruebe.
        </p>
      )}
    </form>
  );
}
