"use client";

import { useRef, type CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS, FORMAT_LABELS, DEFAULT_CARD_FIELDS, type CardField } from "@/lib/content";
import type { Piece } from "./types";

const HOVER_DELAY = 300;

export function PieceCard({
  piece,
  onClick,
  onHoverStart,
  onHoverEnd,
  visibleFields = DEFAULT_CARD_FIELDS,
  compact = false,
}: {
  piece: Piece;
  onClick: () => void;
  onHoverStart?: (piece: Piece, rect: DOMRect) => void;
  onHoverEnd?: () => void;
  visibleFields?: readonly CardField[];
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
  });
  const elRef = useRef<HTMLButtonElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (!onHoverStart) return;
    hoverTimer.current = setTimeout(() => {
      if (elRef.current) onHoverStart(piece, elRef.current.getBoundingClientRect());
    }, HOVER_DELAY);
  }

  function handleMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    onHoverEnd?.();
  }

  const style: CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined),
    ...(isDragging ? { zIndex: 10, opacity: 0.5 } : undefined),
  };

  const show = (f: CardField) => visibleFields.includes(f);

  return (
    <button
      ref={(node) => {
        setNodeRef(node);
        elRef.current = node;
      }}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="surface w-full cursor-grab rounded-[10px] px-2.5 py-1.5 text-left text-xs transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-1">
        <span className={compact ? "truncate font-semibold" : "font-semibold"}>{piece.title}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {show("platform") && <span style={{ color: "var(--text-faint)" }}>{PLATFORM_LABELS[piece.platform]}</span>}
        {show("format") && piece.format && <span style={{ color: "var(--text-faint)" }}>· {FORMAT_LABELS[piece.format]}</span>}
        {show("status") && !compact && (
          <span className={`status-pill ${STATUS_CLASS[piece.status]}`}>
            <span className="d" />
            {STATUS_LABELS[piece.status]}
          </span>
        )}
        {show("topic") && piece.topic && <span style={{ color: "var(--text-faint)" }}>· {piece.topic.name}</span>}
      </div>
      {show("hashtags") && piece.hashtags && (
        <p className="mt-1 truncate" style={{ color: "var(--sky)" }}>{piece.hashtags}</p>
      )}
      {show("comments") && piece.comments.length > 0 && (
        <p className="mt-1 flex items-center gap-1" style={{ color: "var(--text-faint)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          {piece.comments.length}
        </p>
      )}
      {show("internalNotes") && piece.internalNotes && (
        <p
          className="mt-1 flex items-start gap-1 truncate rounded-[6px] px-1.5 py-1"
          style={{ background: "oklch(0.78 0.17 65 / 0.12)", color: "var(--amber)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-2.5 w-2.5 shrink-0">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="truncate">{piece.internalNotes}</span>
        </p>
      )}
    </button>
  );
}
