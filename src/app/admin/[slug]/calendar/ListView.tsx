"use client";

import { useEffect, useRef, useState } from "react";
import { PLATFORM_LABELS, FORMAT_LABELS } from "@/lib/content";
import { StatusPicker } from "./StatusPicker";
import type { ContentStatus } from "@/generated/prisma/enums";
import type { Piece } from "./types";

export function ListView({
  pieces,
  onPieceClick,
  onChangeStatus,
  highlightId,
}: {
  pieces: Piece[];
  onPieceClick: (p: Piece) => void;
  onChangeStatus: (pieceId: string, status: ContentStatus) => void;
  highlightId?: string | null;
}) {
  const sorted = [...pieces].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    const row = rowRefs.current.get(highlightId);
    row?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(highlightId);
    const t = setTimeout(() => setFlashId(null), 1600);
    return () => clearTimeout(t);
  }, [highlightId]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[13.5px]">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Fecha", "Título", "Plataforma", "Formato", "Tema", "Estado", "Hashtags"].map((h) => (
              <th key={h} className="pt-0 pr-2 pb-2.5 text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              ref={(node) => {
                if (node) rowRefs.current.set(p.id, node);
                else rowRefs.current.delete(p.id);
              }}
              onClick={() => onPieceClick(p)}
              className="cursor-pointer transition-colors duration-500 hover:bg-[var(--surface)]"
              style={flashId === p.id ? { background: "oklch(0.72 0.15 215 / 0.16)" } : undefined}
            >
              <td className="py-3 pr-2 whitespace-nowrap" style={{ borderTop: "1px solid var(--border)" }}>
                {new Date(p.scheduledDate).toLocaleDateString("es-AR")}
              </td>
              <td className="py-3 pr-2 font-semibold" style={{ borderTop: "1px solid var(--border)" }}>{p.title}</td>
              <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-dim)" }}>{PLATFORM_LABELS[p.platform]}</td>
              <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-dim)" }}>{p.format ? FORMAT_LABELS[p.format] : "—"}</td>
              <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)" }}>{p.topic?.name ?? "—"}</td>
              <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
                <StatusPicker value={p.status} onChange={(status) => onChangeStatus(p.id, status)} />
              </td>
              <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)", color: "var(--sky)" }}>{p.hashtags ?? "—"}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center" style={{ color: "var(--text-faint)" }}>
                Sin resultados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
