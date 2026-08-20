"use client";

import { useMemo, useState } from "react";
import { PLATFORM_LABELS, PLATFORMS, STATUS_LABELS, STATUS_CLASS, STATUSES } from "@/lib/content";
import type { Piece, TopicOption } from "./types";

const selectCls = "surface rounded-[10px] px-3 py-2 text-[12.5px] font-semibold outline-none";

export function ListView({
  pieces,
  topics,
  onPieceClick,
}: {
  pieces: Piece[];
  topics: TopicOption[];
  onPieceClick: (p: Piece) => void;
}) {
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");

  const filtered = useMemo(() => {
    return pieces
      .filter((p) => !platformFilter || p.platform === platformFilter)
      .filter((p) => !statusFilter || p.status === statusFilter)
      .filter((p) => !topicFilter || p.topicId === topicFilter)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [pieces, platformFilter, statusFilter, topicFilter]);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap gap-2">
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className={selectCls} style={{ color: "var(--text-dim)" }}>
          <option value="">Todas las plataformas</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls} style={{ color: "var(--text-dim)" }}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className={selectCls} style={{ color: "var(--text-dim)" }}>
          <option value="">Todos los temas</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Fecha", "Título", "Plataforma", "Tema", "Estado", "Hashtags"].map((h) => (
                <th key={h} className="pt-0 pr-2 pb-2.5 text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} onClick={() => onPieceClick(p)} className="cursor-pointer transition-colors hover:bg-[var(--surface)]">
                <td className="py-3 pr-2 whitespace-nowrap" style={{ borderTop: "1px solid var(--border)" }}>
                  {new Date(p.scheduledDate).toLocaleDateString("es-AR")}
                </td>
                <td className="py-3 pr-2 font-semibold" style={{ borderTop: "1px solid var(--border)" }}>{p.title}</td>
                <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-dim)" }}>{PLATFORM_LABELS[p.platform]}</td>
                <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)" }}>{p.topic?.name ?? "—"}</td>
                <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className={`status-pill ${STATUS_CLASS[p.status]}`}>
                    <span className="d" />
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="py-3 pr-2" style={{ borderTop: "1px solid var(--border)", color: "var(--sky)" }}>{p.hashtags ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center" style={{ color: "var(--text-faint)" }}>
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
