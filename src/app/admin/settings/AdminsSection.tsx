"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdmin, deleteAdmin, updateAdminAccess, type AdminFormState } from "./actions";

const initialState: AdminFormState = { error: null };
const inputCls = "min-w-0 flex-1 rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

type Client = { id: string; name: string };
type Admin = {
  id: string;
  email: string;
  role: "owner" | "admin";
  createdAt: string;
  canCreateClients: boolean;
  clientIds: string[];
};

// Owner: acceso total, no se edita ni se borra desde acá. Admin acotado:
// ve/opera solo los clientes marcados en clientIds (AdminClientAccess) y
// solo puede crear clientes directo si canCreateClients está tildado — si
// no, su alta de cliente queda como ClientRequest pendiente (ver
// src/app/admin/actions.ts, PendingRequests.tsx). Ver CLAUDE.md,
// "Administradores acotados" (2026-09-04).
export function AdminsSection({
  admins,
  clients,
  currentUserId,
}: {
  admins: Admin[];
  clients: Client[];
  currentUserId: string;
}) {
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
  const [editingId, setEditingId] = useState<string | null>(null);

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
        Vos (owner) ves y gestionas todo. Un admin acotado solo ve/opera los clientes que le asignes, y
        no puede invitar a nadie ni tocar estos permisos.
      </p>

      <ul className="mb-4 flex flex-col gap-1.5">
        {admins.map((admin) => (
          <li key={admin.id} className="surface flex flex-col gap-2 rounded-[12px] px-3.5 py-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {admin.email}
                {admin.id === currentUserId ? (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}>
                    vos
                  </span>
                ) : admin.role === "owner" ? (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--surface-2)", color: "var(--sky)" }}>
                    owner
                  </span>
                ) : null}
              </span>
              {admin.role === "admin" && (
                <span className="flex items-center gap-3 text-xs">
                  <button onClick={() => setEditingId(editingId === admin.id ? null : admin.id)} style={{ color: "var(--sky)" }}>
                    {editingId === admin.id ? "Cerrar" : "Editar acceso"}
                  </button>
                  {confirmingId === admin.id ? (
                    <span className="flex items-center gap-2">
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
                    <button onClick={() => setConfirmingId(admin.id)} style={{ color: "var(--text-faint)" }}>
                      Borrar
                    </button>
                  )}
                </span>
              )}
            </div>

            {admin.role === "admin" && editingId !== admin.id && (
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                {admin.clientIds.length === 0
                  ? "Sin clientes asignados"
                  : clients
                      .filter((c) => admin.clientIds.includes(c.id))
                      .map((c) => c.name)
                      .join(", ")}
                {admin.canCreateClients && " · puede crear clientes directo"}
              </p>
            )}

            {admin.role === "admin" && editingId === admin.id && (
              <AccessForm
                admin={admin}
                clients={clients}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            )}
          </li>
        ))}
      </ul>
      {deleteError && <p className="mb-3 text-sm text-red-400">{deleteError}</p>}

      <form ref={formRef} action={formAction} className="flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-2 sm:flex-row">
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
        </div>

        {clients.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-faint)" }}>
              Clientes que va a poder ver (podés cambiarlo después)
            </p>
            <ClientCheckboxes clients={clients} name="clientIds" />
          </div>
        )}

        <label className="flex items-center gap-2 text-xs" style={{ color: "var(--text-dim)" }}>
          <input type="checkbox" name="canCreateClients" className="h-3.5 w-3.5" />
          Puede dar de alta clientes nuevos directo (si no, sus pedidos te quedan pendientes de aprobar)
        </label>

        <button type="submit" disabled={pending} className="btn-grad self-start">
          {pending ? "Creando..." : "Invitar"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
    </section>
  );
}

function ClientCheckboxes({ clients, name, defaultChecked = [] }: { clients: Client[]; name: string; defaultChecked?: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {clients.map((c) => (
        <label key={c.id} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-dim)" }}>
          <input type="checkbox" name={name} value={c.id} defaultChecked={defaultChecked.includes(c.id)} className="h-3.5 w-3.5" />
          {c.name}
        </label>
      ))}
    </div>
  );
}

function AccessForm({ admin, clients, onDone }: { admin: Admin; clients: Client[]; onDone: () => void }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (fd) => {
        setPending(true);
        fd.set("adminId", admin.id);
        await updateAdminAccess(fd);
        setPending(false);
        onDone();
      }}
      className="rounded-[10px] p-3"
      style={{ background: "var(--surface-2)" }}
    >
      {clients.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          Todavía no hay clientes cargados.
        </p>
      ) : (
        <ClientCheckboxes clients={clients} name="clientIds" defaultChecked={admin.clientIds} />
      )}
      <label className="mt-2.5 flex items-center gap-2 text-xs" style={{ color: "var(--text-dim)" }}>
        <input type="checkbox" name="canCreateClients" defaultChecked={admin.canCreateClients} className="h-3.5 w-3.5" />
        Puede dar de alta clientes nuevos directo
      </label>
      <button type="submit" disabled={pending} className="btn-ghost mt-2.5 text-xs">
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
