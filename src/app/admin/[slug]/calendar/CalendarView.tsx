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
}: {
  date: Date;
  pieces: Piece[];
  inMonth: boolean;
  onPieceClick: (p: Piece) => void;
  onEmptyClick: (dateKey: string) => void;
}) {
  const dateKey = toDateKey(date);
  const { setNodeRef, isOver } = useDroppable({ id: dateKey });
  const isToday = toDateKey(new Date()) === dateKey;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-28 flex-col gap-1 border border-black/10 p-1 dark:border-white/10 ${
        inMonth ? "" : "opacity-40"
      } ${isOver ? "bg-black/5 dark:bg-white/10" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isToday ? "font-bold" : "text-black/50 dark:text-white/50"}`}>
          {date.getDate()}
        </span>
        <button
          onClick={() => onEmptyClick(dateKey)}
          className="text-xs text-black/30 hover:text-black/70 dark:text-white/30 dark:hover:text-white/70"
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {pieces.map((p) => (
          <PieceCard key={p.id} piece={p} onClick={() => onPieceClick(p)} compact />
        ))}
      </div>
    </div>
  );
}

export function CalendarView({
  pieces,
  onPieceClick,
  onEmptyClick,
}: {
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
  onEmptyClick: (dateKey: string) => void;
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
          className="text-sm"
        >
          ← Mes anterior
        </button>
        <span className="text-sm font-medium">
          {monthCursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
          className="text-sm"
        >
          Mes siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-black/10 text-xs dark:bg-white/10">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="bg-white p-1 text-center text-black/50 dark:bg-black dark:text-white/50">
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
          />
        ))}
      </div>
    </div>
  );
}
