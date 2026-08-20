"use client";

import { useDroppable } from "@dnd-kit/core";
import { STATUSES, STATUS_LABELS } from "@/lib/content";
import { PieceCard } from "./PieceCard";
import type { ContentStatus } from "@/generated/prisma/enums";
import type { Piece } from "./types";

function KanbanColumn({
  status,
  pieces,
  onPieceClick,
  onHoverStart,
  onHoverEnd,
}: {
  status: ContentStatus;
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
  onHoverStart: (piece: Piece, rect: DOMRect) => void;
  onHoverEnd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `status:${status}` });

  return (
    <div
      ref={setNodeRef}
      className="flex w-56 shrink-0 flex-col gap-2 rounded-[13px] border p-2.5 transition-colors"
      style={{ borderColor: "var(--border)", background: isOver ? "var(--surface-2)" : "transparent" }}
    >
      <div className="flex items-center justify-between px-0.5 pb-0.5">
        <span className="text-[12px] font-bold tracking-wide uppercase" style={{ color: "var(--text-dim)" }}>
          {STATUS_LABELS[status]}
        </span>
        <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "var(--surface)", color: "var(--text-faint)" }}>
          {pieces.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {pieces.map((p) => (
          <PieceCard key={p.id} piece={p} onClick={() => onPieceClick(p)} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
        ))}
      </div>
    </div>
  );
}

export function KanbanView({
  pieces,
  onPieceClick,
  onHoverStart,
  onHoverEnd,
}: {
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
  onHoverStart: (piece: Piece, rect: DOMRect) => void;
  onHoverEnd: () => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          pieces={pieces.filter((p) => p.status === status)}
          onPieceClick={onPieceClick}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      ))}
    </div>
  );
}
