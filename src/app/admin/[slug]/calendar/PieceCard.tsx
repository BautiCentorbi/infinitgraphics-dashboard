"use client";

import { useDraggable } from "@dnd-kit/core";
import { PLATFORM_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/content";
import type { Piece } from "./types";

export function PieceCard({
  piece,
  onClick,
  compact = false,
}: {
  piece: Piece;
  onClick: () => void;
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`w-full cursor-grab rounded border border-black/10 bg-white px-2 py-1 text-left text-xs shadow-sm active:cursor-grabbing dark:border-white/10 dark:bg-black ${
        isDragging ? "z-10 opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-medium">{piece.title}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <span className="text-black/50 dark:text-white/50">{PLATFORM_LABELS[piece.platform]}</span>
        {!compact && (
          <span className={`rounded px-1.5 py-0.5 ${STATUS_COLORS[piece.status]}`}>
            {STATUS_LABELS[piece.status]}
          </span>
        )}
        {piece.topic && (
          <span className="text-black/40 dark:text-white/40">· {piece.topic.name}</span>
        )}
      </div>
    </button>
  );
}
