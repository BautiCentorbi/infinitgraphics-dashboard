"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ClientCalendarGrid } from "./views/ClientCalendarGrid";
import { ClientKanbanView } from "./views/ClientKanbanView";
import { ClientListView } from "./views/ClientListView";
import { PieceDetail } from "./PieceDetail";
import type { ClientPiece } from "./types";

type View = "calendar" | "kanban" | "list";

const TABS: { key: View; label: string }[] = [
  { key: "calendar", label: "Calendario" },
  { key: "kanban", label: "Kanban" },
  { key: "list", label: "Lista" },
];
const TAB_W = 96;

// Las 3 vistas del calendario editorial (mismo set que ve el admin), del
// lado cliente — reusado tal cual por /c/[slug] (logueado, interactive)
// y /p/[token] (link público de solo lectura, sin login). La única
// diferencia entre ambos modos es `interactive`: controla si aparecen los
// botones de aprobar/pedir cambios y el form de comentar en PieceDetail, y
// si hay banner de "pendientes de tu revisión" (no aplica sin login, ver
// CLAUDE.md "Vista de solo lectura por link", 2026-09-04).
export function ClientCalendarApp({
  slug,
  initialPieces,
  interactive,
}: {
  slug: string;
  initialPieces: ClientPiece[];
  interactive: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("calendar");
  const [pieces, setPieces] = useState(initialPieces);
  const [selected, setSelected] = useState<ClientPiece | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClientPiece["status"] | undefined>(undefined);

  useEffect(() => {
    setPieces(initialPieces);
    setSelected((prev) => (prev ? initialPieces.find((p) => p.id === prev.id) ?? null : null));
  }, [initialPieces]);

  const pendingCount = interactive ? pieces.filter((p) => p.status === "in_review").length : 0;
  const activeIdx = TABS.findIndex((t) => t.key === view);

  function closeDetail() {
    setSelected(null);
    if (interactive) router.refresh();
  }

  return (
    <div>
      {pendingCount > 0 && (
        <button
          onClick={() => {
            setView("list");
            setStatusFilter("in_review");
          }}
          className="surface surface-hover mb-5 flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left text-sm transition-colors"
          style={{ borderColor: "var(--sky)" }}
        >
          <span>
            <strong>{pendingCount}</strong> {pendingCount === 1 ? "pieza pendiente" : "piezas pendientes"} de tu
            revisión
          </span>
          <span style={{ color: "var(--sky)" }}>Ver →</span>
        </button>
      )}

      <div className="mb-5 tabs">
        <div className="tab-indicator" style={{ width: TAB_W, transform: `translateX(${activeIdx * TAB_W}px)` }} />
        {TABS.map((t) => (
          <div
            key={t.key}
            className="tab"
            data-active={view === t.key}
            style={{ width: TAB_W, textAlign: "center" }}
            onClick={() => setView(t.key)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {view === "calendar" && (
        <motion.div key="calendar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <ClientCalendarGrid pieces={pieces} onSelect={setSelected} />
        </motion.div>
      )}
      {view === "kanban" && (
        <motion.div key="kanban" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <ClientKanbanView pieces={pieces} onSelect={setSelected} />
        </motion.div>
      )}
      {view === "list" && (
        <motion.div key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <ClientListView pieces={pieces} onSelect={setSelected} initialStatusFilter={statusFilter} />
        </motion.div>
      )}

      {pieces.length === 0 && (
        <p className="mt-4 text-sm" style={{ color: "var(--text-dim)" }}>
          Todavía no hay contenido compartido para revisar.
        </p>
      )}

      {selected && <PieceDetail piece={selected} slug={slug} onClose={closeDetail} interactive={interactive} />}
    </div>
  );
}
