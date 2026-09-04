"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { approveClientRequest, denyClientRequest } from "./actions";

type Request = { id: string; name: string; requesterEmail: string; createdAt: string };

// Solicitudes de alta de cliente hechas por admins acotados sin
// canCreateClients (ver src/app/admin/actions.ts, createClient) — el owner
// las aprueba (crea el cliente y se lo asigna a quien lo pidió) o las
// rechaza acá.
export function PendingRequests({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handle(id: string, action: (fd: FormData) => Promise<void>) {
    setBusyId(id);
    const fd = new FormData();
    fd.set("id", id);
    await action(fd);
    setBusyId(null);
    router.refresh();
  }

  return (
    <section className="surface mx-auto mb-5 max-w-xl rounded-[18px] p-5 text-left">
      <h2 className="mb-1 text-base font-bold" style={{ color: "var(--amber)" }}>
        Solicitudes de cliente pendientes
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {requests.map((r) => (
          <li key={r.id} className="surface flex items-center justify-between rounded-[12px] px-3.5 py-2.5 text-sm">
            <span>
              <span className="font-semibold">{r.name}</span>
              <span style={{ color: "var(--text-faint)" }}> — pedido por {r.requesterEmail}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3 text-xs">
              <button
                onClick={() => handle(r.id, approveClientRequest)}
                disabled={busyId === r.id}
                className="font-semibold underline"
                style={{ color: "var(--sky)" }}
              >
                Aprobar
              </button>
              <button
                onClick={() => handle(r.id, denyClientRequest)}
                disabled={busyId === r.id}
                style={{ color: "var(--text-faint)" }}
              >
                Rechazar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
