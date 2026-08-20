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
}: {
  status: ContentStatus;
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `status:${status}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-56 shrink-0 flex-col gap-2 rounded border border-black/10 p-2 dark:border-white/10 ${
        isOver ? "bg-black/5 dark:bg-white/10" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
        {STATUS_LABELS[status]} ({pieces.length})
      </p>
      <div className="flex flex-col gap-2">
        {pieces.map((p) => (
          <PieceCard key={p.id} piece={p} onClick={() => onPieceClick(p)} />
        ))}
      </div>
    </div>
  );
}

export function KanbanView({
  pieces,
  onPieceClick,
}: {
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          pieces={pieces.filter((p) => p.status === status)}
          onPieceClick={onPieceClick}
        />
      ))}
    </div>
  );
}
