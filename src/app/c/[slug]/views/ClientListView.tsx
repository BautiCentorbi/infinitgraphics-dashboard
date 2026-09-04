"use client";

import { useState } from "react";
import { PLATFORM_LABELS, PLATFORMS, STATUS_LABELS, STATUS_CLASS } from "@/lib/content";
import type { Platform, ContentStatus } from "@/generated/prisma/enums";
import type { ClientPiece } from "../types";

const LIST_STATUSES: ContentStatus[] = ["in_review", "changes_requested", "approved", "scheduled", "published"];

export function ClientListView({
  pieces,
  onSelect,
  initialStatusFilter,
}: {
  pieces: ClientPiece[];
  onSelect: (p: ClientPiece) => void;
  initialStatusFilter?: ContentStatus;
}) {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [status, setStatus] = useState<ContentStatus | "">(initialStatusFilter ?? "");

  const filtered = pieces
    .filter((p) => !platform || p.platform === platform)
    .filter((p) => !status || p.status === status)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform | "")}
          className="select-field rounded-[10px] border bg-black/20 px-2.5 py-1.5 text-xs outline-none"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="">Toda plataforma</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ContentStatus | "")}
          className="select-field rounded-[10px] border bg-black/20 px-2.5 py-1.5 text-xs outline-none"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="">Todo estado</option>
          {LIST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Sin piezas para este filtro.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p)}
                className="surface surface-hover flex w-full items-center justify-between gap-2 rounded-[13px] px-3.5 py-2.5 text-left text-sm transition-colors"
              >
                <span>
                  <span className="font-semibold">{p.title}</span>
                  <span className="ml-2" style={{ color: "var(--text-faint)" }}>
                    {PLATFORM_LABELS[p.platform]} · {new Date(p.scheduledDate).toLocaleDateString("es-AR")}
                  </span>
                </span>
                <span className={`status-pill shrink-0 ${STATUS_CLASS[p.status]}`}>
                  <span className="d" />
                  {STATUS_LABELS[p.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
