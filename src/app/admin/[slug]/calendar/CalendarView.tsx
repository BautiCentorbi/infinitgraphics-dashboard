"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { getMonthGrid, toDateKey, sameMonth } from "@/lib/calendarGrid";
import { PieceCard } from "./PieceCard";
import type { Piece } from "./types";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function DayCell({
  date,
  pieces,
  inMonth,
  onPieceClick,
  onEmptyClick,
  onHoverStart,
  onHoverEnd,
}: {
  date: Date;
  pieces: Piece[];
  inMonth: boolean;
  onPieceClick: (p: Piece) => void;
  onEmptyClick: (dateKey: string) => void;
  onHoverStart: (piece: Piece, rect: DOMRect) => void;
  onHoverEnd: () => void;
}) {
  const dateKey = toDateKey(date);
  const { setNodeRef, isOver } = useDroppable({ id: dateKey });
  const isToday = toDateKey(new Date()) === dateKey;

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-28 flex-col gap-1 p-1.5 transition-colors"
      style={{
        background: isOver ? "var(--surface-2)" : "var(--bg)",
        opacity: inMonth ? 1 : 0.35,
      }}
    >
      <div className="flex items-center justify-between">
        {isToday ? (
          <span
            className="flex h-[19px] w-[19px] items-center justify-center rounded-full text-[11.5px] font-bold text-white"
            style={{ background: "var(--grad)" }}
          >
            {date.getDate()}
          </span>
        ) : (
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--text-faint)" }}>
            {date.getDate()}
          </span>
        )}
        <button onClick={() => onEmptyClick(dateKey)} className="text-xs" style={{ color: "var(--text-faint)" }}>
          +
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {pieces.map((p) => (
          <PieceCard
            key={p.id}
            piece={p}
            onClick={() => onPieceClick(p)}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            compact
          />
        ))}
      </div>
    </div>
  );
}

export function CalendarView({
  pieces,
  onPieceClick,
  onEmptyClick,
  onHoverStart,
  onHoverEnd,
}: {
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
  onEmptyClick: (dateKey: string) => void;
  onHoverStart: (piece: Piece, rect: DOMRect) => void;
  onHoverEnd: () => void;
}) {
  const [monthCursor, setMonthCursor] = useState(new Date());
  const grid = getMonthGrid(monthCursor);

  const piecesByDay = new Map<string, Piece[]>();
  for (const p of pieces) {
    const key = p.scheduledDate.slice(0, 10);
    piecesByDay.set(key, [...(piecesByDay.get(key) ?? []), p]);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
          className="surface flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-sm transition-colors"
          style={{ color: "var(--text-dim)" }}
        >
          ‹
        </button>
        <span className="text-[15px] font-bold capitalize">
          {monthCursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
          className="surface flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-sm transition-colors"
          style={{ color: "var(--text-dim)" }}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[14px] border" style={{ background: "var(--border)", borderColor: "var(--border)" }}>
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="p-2 text-center text-[11px] font-bold tracking-wide uppercase"
            style={{ background: "var(--surface)", color: "var(--text-faint)" }}
          >
            {d}
          </div>
        ))}
        {grid.map((date) => (
          <DayCell
            key={toDateKey(date)}
            date={date}
            pieces={piecesByDay.get(toDateKey(date)) ?? []}
            inMonth={sameMonth(date, monthCursor)}
            onPieceClick={onPieceClick}
            onEmptyClick={onEmptyClick}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
          />
        ))}
      </div>
    </div>
  );
}
