"use client";

import { useState } from "react";
import { getMonthGrid, toDateKey, sameMonth } from "@/lib/calendarGrid";
import { ClientPieceCard } from "./ClientPieceCard";
import type { ClientPiece } from "../types";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Grilla mensual de solo lectura — mismo layout que CalendarView (admin),
// sin drag & drop (el cliente nunca reprograma piezas, logueado o no).
export function ClientCalendarGrid({ pieces, onSelect }: { pieces: ClientPiece[]; onSelect: (p: ClientPiece) => void }) {
  const [monthCursor, setMonthCursor] = useState(new Date());
  const grid = getMonthGrid(monthCursor);

  const byDay = new Map<string, ClientPiece[]>();
  for (const p of pieces) {
    const key = p.scheduledDate.slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), p]);
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
        {grid.map((date) => {
          const key = toDateKey(date);
          const inMonth = sameMonth(date, monthCursor);
          const isToday = toDateKey(new Date()) === key;
          return (
            <div
              key={key}
              className="flex min-h-24 flex-col gap-1 p-1.5"
              style={{ background: "var(--bg)", opacity: inMonth ? 1 : 0.35 }}
            >
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
              <div className="flex flex-col gap-1">
                {(byDay.get(key) ?? []).map((p) => (
                  <ClientPieceCard key={p.id} piece={p} onClick={() => onSelect(p)} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
