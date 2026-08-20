"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAvailableInstagramAccounts, connectDataConnection } from "./actions";
import type { WindsorInstagramAccount } from "@/lib/windsor";

const IG_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect x="2" y="2" width="20" height="20" rx="6" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export function ConnectInstagram({ clientId, slug }: { clientId: string; slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<WindsorInstagramAccount[] | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openPicker() {
    setOpen(true);
    setError(null);
    if (accounts) return;
    setLoading(true);
    try {
      const list = await getAvailableInstagramAccounts();
      setAccounts(list);
    } finally {
      setLoading(false);
    }
  }

  async function connect(acc: WindsorInstagramAccount) {
    setConnecting(acc.accountId);
    try {
      await connectDataConnection({
        clientId,
        slug,
        platform: "instagram",
        externalAccountId: acc.accountId,
        accountName: acc.username,
      });
      router.refresh();
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setConnecting(null);
    }
  }

  return (
    <section className="surface mb-8 rounded-[16px] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: "var(--surface-2)", color: "var(--sky)" }}>
            {IG_ICON}
          </div>
          <div>
            <p className="text-sm font-bold">Instagram</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>Sin conectar todavía</p>
          </div>
        </div>
        <button onClick={openPicker} className="btn-grad px-3.5 py-2 text-xs">
          Conectar
        </button>
      </div>

      {open && (
        <div className="mt-3.5 border-t pt-3.5" style={{ borderColor: "var(--border)" }}>
          {loading && <p className="text-sm" style={{ color: "var(--text-dim)" }}>Buscando cuentas conectadas en Windsor.ai...</p>}
          {!loading && accounts && accounts.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              No hay cuentas de Instagram conectadas en Windsor.ai todavía — conectala primero desde el dashboard de
              Windsor y volvé acá.
            </p>
          )}
          {!loading && accounts && accounts.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {accounts.map((acc) => (
                <li key={acc.accountId}>
                  <button
                    onClick={() => connect(acc)}
                    disabled={connecting !== null}
                    className="surface surface-hover flex w-full items-center justify-between rounded-[11px] px-3 py-2 text-left text-sm transition-colors disabled:opacity-50"
                  >
                    <span className="font-semibold">@{acc.username}</span>
                    <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                      {connecting === acc.accountId ? "Conectando..." : `${acc.followers.toLocaleString("es-AR")} seguidores`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
      )}
    </section>
  );
}
