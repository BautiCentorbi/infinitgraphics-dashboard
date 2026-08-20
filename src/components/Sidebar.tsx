"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AVATAR_GRADIENTS, initials } from "@/lib/avatar";
import { signOutAction } from "@/app/admin/actions";

type ClientLite = { id: string; name: string; slug: string; avatarUrl: string | null };

const PIN_KEY = "cm-suite:sidebar-pinned";
const GAP = 12; // separación de la isla respecto a los bordes de la ventana
const RAIL_W = 64;
const PANEL_W = 272;

const SUB_LINKS = [
  { hash: "", label: "Workspace" },
  { hash: "tareas", label: "Tareas" },
  { hash: "documentacion", label: "Documentación" },
  { hash: "notas", label: "Notas" },
];

// Secciones generales del panel — Clientes es la que ya existía (la lista
// de abajo); Métricas/Calendarios/Configuración son nuevas, hoy páginas
// "Próximamente" (ver src/components/ComingSoon.tsx), pero ya con su lugar
// fijo en la navegación.
const TOP_NAV = [
  {
    href: "/admin",
    label: "Clientes",
    match: (p: string) => p === "/admin" || (p.startsWith("/admin/") && !["metrics", "calendars", "settings"].some((r) => p.startsWith(`/admin/${r}`))),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/metrics",
    label: "Métricas",
    match: (p: string) => p.startsWith("/admin/metrics"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M3 3v18h18" />
        <path d="M18 17V9M13 17V5M8 17v-4" />
      </svg>
    ),
  },
  {
    href: "/admin/calendars",
    label: "Calendarios",
    match: (p: string) => p.startsWith("/admin/calendars"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Configuración",
    match: (p: string) => p.startsWith("/admin/settings"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

// Sidebar flotante para el lado admin (nunca en /c/[slug]) — una "isla"
// separada de los bordes de la ventana (no pegada a la pared), con una
// franja angosta siempre visible con los clientes, que se expande sobre el
// contenido (no lo empuja) al hacer hover o al fijarla con el pin. El
// cliente activo según la ruta actual se auto-expande mostrando sus
// secciones (Tareas/Documentación/Notas son anchors dentro de la misma
// página de workspace, ver ids en admin/[slug]/page.tsx).
export function Sidebar({ clients }: { clients: ClientLite[] }) {
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    try {
      setPinned(localStorage.getItem(PIN_KEY) === "1");
    } catch {
      // localStorage deshabilitado — sigue sin fijar.
    }
  }, []);

  function togglePin() {
    setPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PIN_KEY, next ? "1" : "0");
      } catch {
        // no pasa nada si no se puede persistir
      }
      return next;
    });
  }

  const open = pinned || hovering;
  const activeSlugMatch = pathname.match(/^\/admin\/([^/]+)/);
  const activeSlug = activeSlugMatch && activeSlugMatch[1] !== "" ? activeSlugMatch[1] : null;
  const onCalendar = pathname.endsWith("/calendar");
  const onClientsSection = TOP_NAV[0].match(pathname);

  return (
    <motion.div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      animate={{ width: open ? PANEL_W : RAIL_W }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed z-40 flex flex-col overflow-hidden rounded-[22px] border"
      style={{
        top: GAP,
        left: GAP,
        height: `calc(100vh - ${GAP * 2}px)`,
        borderColor: "var(--border-strong)",
        background: "var(--surface)",
        boxShadow: "0 20px 50px -20px oklch(0 0 0 / 0.65)",
      }}
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center px-3.5">
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: "var(--grad)", boxShadow: "0 6px 18px -4px var(--grad-shadow)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
              <rect x="3" y="4" width="18" height="17" rx="3" />
              <path d="M8 2v4M16 2v4M3 10h18" />
              <circle cx="9" cy="15" r="1.2" fill="white" stroke="none" />
              <circle cx="15" cy="15" r="1.2" fill="white" stroke="none" />
            </svg>
          </div>
          {open && <span className="font-display text-[15px] font-bold whitespace-nowrap">cm-suite</span>}
        </Link>
      </div>

      {/* Pin — grande y evidente, siempre visible (colapsado o no) */}
      <div className="shrink-0 px-2.5 pb-2.5">
        <button
          onClick={togglePin}
          aria-label={pinned ? "Desfijar menú" : "Fijar menú abierto"}
          title={pinned ? "Desfijar menú" : "Fijar menú abierto"}
          className="flex h-9 w-full items-center gap-2.5 rounded-[12px] px-2.5 text-xs font-bold transition-colors"
          style={
            pinned
              ? { background: "oklch(0.72 0.15 215 / 0.16)", color: "var(--sky)", border: "1px solid oklch(0.72 0.15 215 / 0.4)" }
              : { background: "var(--surface-2)", color: "var(--text-dim)", border: "1px solid var(--border)" }
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill={pinned ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
          >
            <path d="M12 17v5M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6z" />
          </svg>
          {open && <span className="whitespace-nowrap">{pinned ? "Fijado" : "Fijar menú"}</span>}
        </button>
      </div>

      {/* Secciones generales del panel */}
      <div className="shrink-0 px-2.5 pb-2">
        <ul className="flex flex-col gap-0.5">
          {TOP_NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-[10px] px-2 py-2 text-sm font-semibold transition-colors"
                  style={active ? { background: "var(--surface-2)", color: "var(--text)" } : { color: "var(--text-dim)" }}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center" style={{ color: active ? "var(--sky)" : "var(--text-faint)" }}>
                    {item.icon}
                  </span>
                  {open && <span className="truncate whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mx-2.5 mb-2 border-t" style={{ borderColor: "var(--border)" }} />

      {/* Clientes (lista expandida, solo tiene sentido en esa sección) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 pb-3">
        {open && onClientsSection && (
          <p className="mb-2 px-2 text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
            Tus clientes
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {clients.map((client, i) => {
            const isActiveClient = client.slug === activeSlug;
            return (
              <li key={client.id}>
                <Link
                  href={`/admin/${client.slug}`}
                  className="flex items-center gap-2.5 rounded-[10px] px-1.5 py-1.5 text-sm font-semibold transition-colors"
                  style={isActiveClient ? { background: "var(--surface-2)", color: "var(--text)" } : { color: "var(--text-dim)" }}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] text-[11px] font-bold text-white"
                    style={{ background: client.avatarUrl ? undefined : AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                  >
                    {client.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={client.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(client.name)
                    )}
                  </span>
                  {open && <span className="truncate">{client.name}</span>}
                </Link>

                {open && isActiveClient && (
                  <ul className="mt-0.5 mb-1 ml-[19px] flex flex-col gap-0.5 border-l pl-3" style={{ borderColor: "var(--border)" }}>
                    {SUB_LINKS.map((s) => {
                      // Tareas/Documentación/Notas son anchors dentro de la
                      // misma página de workspace — no hay ruta propia para
                      // resaltarlos como "activos", solo Workspace en sí.
                      const isActive = s.hash === "" && !onCalendar;
                      return (
                        <li key={s.label}>
                          <Link
                            href={`/admin/${client.slug}${s.hash ? `#${s.hash}` : ""}`}
                            className="block rounded-[8px] px-2 py-1 text-xs transition-colors hover:text-[var(--text)]"
                            style={{ color: isActive ? "var(--sky)" : "var(--text-faint)" }}
                          >
                            {s.label}
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link
                        href={`/admin/${client.slug}/calendar`}
                        className="block rounded-[8px] px-2 py-1 text-xs transition-colors hover:text-[var(--text)]"
                        style={{ color: onCalendar ? "var(--sky)" : "var(--text-faint)" }}
                      >
                        Calendario
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Usuario / salir */}
      <div className="shrink-0 border-t p-2.5" style={{ borderColor: "var(--border)" }}>
        <form action={signOutAction} className="flex items-center gap-2.5 rounded-[10px] px-1 py-1.5">
          <div className="avatar-ring h-7 w-7 shrink-0">
            <div className="inner h-full w-full text-[10.5px]">BC</div>
          </div>
          {open && (
            <button type="submit" className="text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-dim)" }}>
              Salir
            </button>
          )}
        </form>
      </div>
    </motion.div>
  );
}
