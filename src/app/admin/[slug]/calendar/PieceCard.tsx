"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS } from "@/lib/content";
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

  const style: CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined),
    ...(isDragging ? { zIndex: 10, opacity: 0.5 } : undefined),
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="surface w-full cursor-grab rounded-[10px] px-2.5 py-1.5 text-left text-xs transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-semibold">{piece.title}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span style={{ color: "var(--text-faint)" }}>{PLATFORM_LABELS[piece.platform]}</span>
        {!compact && (
          <span className={`status-pill ${STATUS_CLASS[piece.status]}`}>
            <span className="d" />
            {STATUS_LABELS[piece.status]}
          </span>
        )}
        {piece.topic && <span style={{ color: "var(--text-faint)" }}>· {piece.topic.name}</span>}
      </div>
    </button>
  );
}
