import Link from "next/link";

// Barra de navegación compartida entre /admin, /admin/[slug] y
// /admin/[slug]/calendar. "Calendario" solo es un link real cuando estamos
// dentro de un cliente (calendarSlug presente) — si no, es un label inerte.
export function AdminNav({
  active,
  calendarSlug,
}: {
  active: "clientes" | "calendario";
  calendarSlug?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b px-10 py-4.5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-8">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[9px]"
            style={{ background: "var(--grad)", boxShadow: "0 6px 18px -4px var(--grad-shadow)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
              <rect x="3" y="4" width="18" height="17" rx="3" />
              <path d="M8 2v4M16 2v4M3 10h18" />
              <circle cx="9" cy="15" r="1.2" fill="white" stroke="none" />
              <circle cx="15" cy="15" r="1.2" fill="white" stroke="none" />
            </svg>
          </div>
          <span className="font-display text-[17px] font-bold">cm-suite</span>
        </Link>
        <div className="flex gap-1">
          <Link
            href="/admin"
            className="rounded-[9px] px-3.5 py-2 text-sm font-semibold transition-colors"
            style={active === "clientes" ? { color: "var(--text)", background: "var(--surface-2)" } : { color: "var(--text-dim)" }}
          >
            Clientes
          </Link>
          {calendarSlug ? (
            <Link
              href={`/admin/${calendarSlug}/calendar`}
              className="rounded-[9px] px-3.5 py-2 text-sm font-semibold transition-colors"
              style={active === "calendario" ? { color: "var(--text)", background: "var(--surface-2)" } : { color: "var(--text-dim)" }}
            >
              Calendario
            </Link>
          ) : (
            <span className="rounded-[9px] px-3.5 py-2 text-sm font-semibold" style={{ color: "var(--text-faint)" }}>
              Calendario
            </span>
          )}
        </div>
      </div>
      <div className="avatar-ring h-9 w-9">
        <div className="inner h-full w-full text-[13px]">BC</div>
      </div>
    </div>
  );
}
