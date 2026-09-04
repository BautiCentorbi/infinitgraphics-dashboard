"use client";

import { STATUS_LABELS } from "@/lib/content";
import { ClientPieceCard } from "./ClientPieceCard";
import type { ContentStatus } from "@/generated/prisma/enums";
import type { ClientPiece } from "../types";

// El cliente nunca ve "draft" (la query de page.tsx ya lo excluye) — las
// columnas arrancan en "en revisión". Sin drag & drop, a diferencia del
// kanban admin: acá es solo lectura, cambiar de estado sigue siendo cosa
// del CM o del propio cliente vía los botones de PieceDetail (logueado).
const KANBAN_STATUSES: ContentStatus[] = ["in_review", "changes_requested", "approved", "scheduled", "published"];

export function ClientKanbanView({ pieces, onSelect }: { pieces: ClientPiece[]; onSelect: (p: ClientPiece) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {KANBAN_STATUSES.map((status) => {
        const columnPieces = pieces.filter((p) => p.status === status);
        return (
          <div
            key={status}
            className="flex w-52 shrink-0 flex-col gap-2 rounded-[13px] border p-2.5"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between px-0.5 pb-0.5">
              <span className="text-[12px] font-bold tracking-wide uppercase" style={{ color: "var(--text-dim)" }}>
                {STATUS_LABELS[status]}
              </span>
              <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "var(--surface)", color: "var(--text-faint)" }}>
                {columnPieces.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {columnPieces.map((p) => (
                <ClientPieceCard key={p.id} piece={p} onClick={() => onSelect(p)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
