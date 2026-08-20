"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdmin, deleteAdmin, type AdminFormState } from "./actions";

const initialState: AdminFormState = { error: null };
const inputCls = "min-w-0 flex-1 rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

type Admin = { id: string; email: string; createdAt: string };

export function AdminsSection({ admins, currentUserId }: { admins: Admin[]; currentUserId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: AdminFormState, fd: FormData) => {
    const result = await createAdmin(prev, fd);
    if (!result.error) {
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  }, initialState);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleteError(null);
    setDeletingId(id);
    const fd = new FormData();
    fd.set("id", id);
    const result = await deleteAdmin(fd);
    setDeletingId(null);
    setConfirmingId(null);
    if (result.error) setDeleteError(result.error);
    else router.refresh();
  }

  return (
    <section className="surface mx-auto max-w-xl rounded-[18px] p-5 text-left">
      <h2 className="mb-1 text-base font-bold">Administradores</h2>
      <p className="mb-4 text-sm" style={{ color: "var(--text-dim)" }}>
        Todos los administradores tienen el mismo acceso: ven y gestionan todos los clientes.
      </p>

      <ul className="mb-4 flex flex-col gap-1.5">
        {admins.map((admin) => (
          <li key={admin.id} className="surface flex items-center justify-between rounded-[12px] px-3.5 py-2.5 text-sm">
            <span className="flex items-center gap-2">
              {admin.email}
              {admin.id === currentUserId && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}>
                  vos
                </span>
              )}
            </span>
            {admin.id !== currentUserId &&
              (confirmingId === admin.id ? (
                <span className="flex items-center gap-2 text-xs">
                  <span style={{ color: "var(--amber)" }}>¿Borrar?</span>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    disabled={deletingId === admin.id}
                    className="font-semibold text-red-400 underline"
                  >
                    {deletingId === admin.id ? "..." : "Sí"}
                  </button>
                  <button onClick={() => setConfirmingId(null)} style={{ color: "var(--text-faint)" }}>
                    No
                  </button>
                </span>
              ) : (
                <button onClick={() => setConfirmingId(admin.id)} className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Borrar
                </button>
              ))}
          </li>
        ))}
      </ul>
      {deleteError && <p className="mb-3 text-sm text-red-400">{deleteError}</p>}

      <form ref={formRef} action={formAction} className="flex flex-col gap-2 border-t pt-4 sm:flex-row" style={{ borderColor: "var(--border)" }}>
        <input name="email" type="email" placeholder="email del nuevo admin" required className={inputCls} style={{ borderColor: "var(--border)" }} />
        <input
          name="password"
          type="text"
          placeholder="contraseña (mín. 8 caracteres)"
          required
          minLength={8}
          className={inputCls}
          style={{ borderColor: "var(--border)" }}
        />
        <button type="submit" disabled={pending} className="btn-grad shrink-0">
          {pending ? "Creando..." : "Invitar"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
    </section>
  );
}
