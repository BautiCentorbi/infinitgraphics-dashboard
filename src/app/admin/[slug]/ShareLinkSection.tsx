"use client";

import { useState } from "react";
import { regenerateShareToken } from "../actions";

// Link público de solo lectura (/p/[shareToken]) — mismo calendario que ve
// un cliente logueado (calendario/kanban/lista), sin necesitar cuenta, pero
// sin poder comentar ni aprobar/pedir cambios (eso sigue requiriendo el
// login real en /c/[slug]). Ver CLAUDE.md, "Vista de solo lectura por
// link" (2026-09-04).
export function ShareLinkSection({ clientId, slug, shareToken }: { clientId: string; slug: string; shareToken: string | null }) {
  const [token, setToken] = useState(shareToken);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  // window solo existe en el cliente — el link refleja el dominio desde el
  // que se está navegando ahora (bcentorbi.online o el *.vercel.app), no
  // uno hardcodeado.
  const url = token && typeof window !== "undefined" ? `${window.location.origin}/p/${token}` : "";

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function regenerate() {
    setPending(true);
    const newToken = await regenerateShareToken(clientId, slug);
    setToken(newToken);
    setPending(false);
    setConfirming(false);
  }

  return (
    <section className="surface mb-8 rounded-[16px] p-4">
      <h2 className="mb-1 text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
        Link para compartir (solo lectura)
      </h2>
      <p className="mb-3 text-xs" style={{ color: "var(--text-dim)" }}>
        Cualquiera con este link ve el calendario (calendario/kanban/lista) sin necesitar cuenta — no puede comentar
        ni aprobar/pedir cambios. Para eso sigue haciendo falta un login de cliente.
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-[10px] border bg-black/20 px-3 py-2 text-xs outline-none"
          style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
        />
        <button onClick={copy} className="btn-ghost shrink-0 text-xs">
          {copied ? "Copiado" : "Copiar"}
        </button>
        {confirming ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs">
            <span style={{ color: "var(--amber)" }}>¿Regenerar?</span>
            <button onClick={regenerate} disabled={pending} className="font-semibold text-red-400 underline">
              {pending ? "..." : "Sí"}
            </button>
            <button onClick={() => setConfirming(false)} style={{ color: "var(--text-faint)" }}>
              No
            </button>
          </span>
        ) : (
          <button onClick={() => setConfirming(true)} className="shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>
            Regenerar
          </button>
        )}
      </div>
      {confirming === false && (
        <p className="mt-1.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
          Regenerar invalida el link actual — quien lo tenía deja de poder verlo.
        </p>
      )}
    </section>
  );
}
