"use client";

import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS } from "@/lib/content";
import type { ClientPiece } from "../types";

// Tarjeta compacta para Calendario/Kanban del lado cliente (logueado o vía
// link público) — versión liviana de PieceCard (admin): sin hover-preview,
// sin campos configurables, siempre los mismos 2-3 datos.
export function ClientPieceCard({ piece, onClick, compact }: { piece: ClientPiece; onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="surface surface-hover flex w-full flex-col items-start gap-1 rounded-[10px] px-2 py-1.5 text-left transition-colors"
    >
      <p className="w-full truncate text-[11.5px] font-semibold">{piece.title}</p>
      {!compact && (
        <p className="w-full truncate text-[10.5px]" style={{ color: "var(--text-faint)" }}>
          {PLATFORM_LABELS[piece.platform]}
        </p>
      )}
      <span className={`status-pill ${STATUS_CLASS[piece.status]}`}>
        <span className="d" />
        {STATUS_LABELS[piece.status]}
      </span>
    </button>
  );
}
