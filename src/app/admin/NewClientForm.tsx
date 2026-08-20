"use client";

import { useActionState } from "react";
import { createClient, type ClientFormState } from "./actions";

const initialState: ClientFormState = { error: null };

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClient, initialState);

  return (
    <form action={formAction} className="mb-6 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="Nombre del cliente (ej. Cuenca del Sur)"
          required
          className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Agregando..." : "Agregar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
