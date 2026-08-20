"use client";

import { useMemo, useState } from "react";
import { PLATFORM_LABELS, PLATFORMS, STATUS_LABELS, STATUS_COLORS, STATUSES } from "@/lib/content";
import type { Piece, TopicOption } from "./types";

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
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        >
          <option value="">Todas las plataformas</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        >
          <option value="">Todos los temas</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase text-black/50 dark:border-white/10 dark:text-white/50">
              <th className="py-2 pr-2">Fecha</th>
              <th className="py-2 pr-2">Título</th>
              <th className="py-2 pr-2">Plataforma</th>
              <th className="py-2 pr-2">Tema</th>
              <th className="py-2 pr-2">Estado</th>
              <th className="py-2 pr-2">Hashtags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => onPieceClick(p)}
                className="cursor-pointer border-b border-black/5 hover:bg-black/5 dark:border-white/5 dark:hover:bg-white/5"
              >
                <td className="py-2 pr-2 whitespace-nowrap">
                  {new Date(p.scheduledDate).toLocaleDateString("es-AR")}
                </td>
                <td className="py-2 pr-2">{p.title}</td>
                <td className="py-2 pr-2">{PLATFORM_LABELS[p.platform]}</td>
                <td className="py-2 pr-2">{p.topic?.name ?? "—"}</td>
                <td className="py-2 pr-2">
                  <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="py-2 pr-2 text-black/60 dark:text-white/60">{p.hashtags ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-black/50 dark:text-white/50">
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
