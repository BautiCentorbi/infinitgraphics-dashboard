"use client";

import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS, FORMAT_LABELS } from "@/lib/content";
import type { Piece } from "./types";

// Popover que aparece al hacer hover sobre una pieza (Calendario/Kanban) sin
// necesidad de click — muestra todo el detalle y un acceso directo a
// editar. Se posiciona con position:fixed calculado a partir del rect del
// elemento que dispara el hover, así escapa cualquier overflow:hidden de
// contenedores ancestros (la grilla del calendario, las columnas del
// kanban).
export function PiecePreview({
  piece,
  anchorRect,
  onEdit,
  onMouseEnter,
  onMouseLeave,
}: {
  piece: Piece;
  anchorRect: DOMRect;
  onEdit: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const width = 280;
  const margin = 10;
  let left = anchorRect.right + margin;
  if (left + width > window.innerWidth - 12) {
    left = Math.max(12, anchorRect.left - width - margin);
  }
  const top = Math.min(anchorRect.top, window.innerHeight - 320);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-30 rounded-[16px] border p-4 text-left text-xs"
      style={{
        left,
        top: Math.max(12, top),
        width,
        borderColor: "var(--border-strong)",
        background: "var(--surface-2)",
        boxShadow: "0 24px 60px -16px oklch(0 0 0 / 0.55)",
      }}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-[13.5px] font-bold">{piece.title}</p>
      </div>
      <p className="mb-2" style={{ color: "var(--text-faint)" }}>
        {PLATFORM_LABELS[piece.platform]}
        {piece.format && ` · ${FORMAT_LABELS[piece.format]}`} · {new Date(piece.scheduledDate).toLocaleDateString("es-AR")}
        {piece.topic && ` · ${piece.topic.name}`}
      </p>
      <span className={`status-pill mb-2.5 ${STATUS_CLASS[piece.status]}`}>
        <span className="d" />
        {STATUS_LABELS[piece.status]}
      </span>
      {piece.copy && (
        <p className="mt-2.5 line-clamp-3" style={{ color: "var(--text-dim)" }}>
          {piece.copy}
        </p>
      )}
      {piece.hashtags && <p className="mt-1.5" style={{ color: "var(--sky)" }}>{piece.hashtags}</p>}
      {piece.internalNotes && (
        <p
          className="mt-2 flex items-start gap-1.5 rounded-[9px] px-2 py-1.5"
          style={{ background: "oklch(0.78 0.17 65 / 0.12)", color: "var(--amber)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-3 w-3 shrink-0">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {piece.internalNotes}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
        <span className="flex items-center gap-1" style={{ color: "var(--text-faint)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          {piece.comments.length}
        </span>
        <button onClick={onEdit} className="text-[12px] font-bold" style={{ color: "var(--sky)" }}>
          Editar →
        </button>
      </div>
    </div>
  );
}
