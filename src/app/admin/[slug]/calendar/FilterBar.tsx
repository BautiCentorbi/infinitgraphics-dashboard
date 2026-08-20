"use client";

import { PLATFORM_LABELS, PLATFORMS, STATUS_LABELS, STATUSES } from "@/lib/content";
import type { TopicOption } from "./types";

const selectCls = "surface rounded-[10px] px-3 py-2 text-[12.5px] font-semibold outline-none";

// Filtros por propiedades (plataforma/estado/tema) — compartidos entre las
// 3 vistas del calendario, no solo la Lista (a pedido de Bautista).
export function FilterBar({
  topics,
  platformFilter,
  statusFilter,
  topicFilter,
  onPlatformChange,
  onStatusChange,
  onTopicChange,
}: {
  topics: TopicOption[];
  platformFilter: string;
  statusFilter: string;
  topicFilter: string;
  onPlatformChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTopicChange: (v: string) => void;
}) {
  const activeCount = [platformFilter, statusFilter, topicFilter].filter(Boolean).length;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <select value={platformFilter} onChange={(e) => onPlatformChange(e.target.value)} className={selectCls} style={{ color: "var(--text-dim)" }}>
        <option value="">Todas las plataformas</option>
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>
            {PLATFORM_LABELS[p]}
          </option>
        ))}
      </select>
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={selectCls} style={{ color: "var(--text-dim)" }}>
        <option value="">Todos los estados</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select value={topicFilter} onChange={(e) => onTopicChange(e.target.value)} className={selectCls} style={{ color: "var(--text-dim)" }}>
        <option value="">Todos los temas</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {activeCount > 0 && (
        <button
          onClick={() => {
            onPlatformChange("");
            onStatusChange("");
            onTopicChange("");
          }}
          className="text-xs font-semibold underline"
          style={{ color: "var(--text-faint)" }}
        >
          Limpiar filtros ({activeCount})
        </button>
      )}
    </div>
  );
}
