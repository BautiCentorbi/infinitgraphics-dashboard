"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS } from "@/lib/content";
import { PieceDetail } from "./PieceDetail";
import type { ClientPiece } from "./types";

export function ClientCalendar({ slug, initialPieces }: { slug: string; initialPieces: ClientPiece[] }) {
  const router = useRouter();
  const [pieces, setPieces] = useState(initialPieces);
  const [selected, setSelected] = useState<ClientPiece | null>(null);

  useEffect(() => {
    setPieces(initialPieces);
    // Si hay una pieza abierta, refrescamos su versión con los datos nuevos
    // (por si se agregó un comentario o cambió el estado desde otra pestaña).
    setSelected((prev) => (prev ? initialPieces.find((p) => p.id === prev.id) ?? null : null));
  }, [initialPieces]);

  const sorted = [...pieces].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const pending = sorted.filter((p) => p.status === "in_review");
  const rest = sorted.filter((p) => p.status !== "in_review");

  function closeDetail() {
    setSelected(null);
    router.refresh();
  }

  return (
    <div>
      {pending.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-2.5 text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
            Pendientes de tu revisión
          </h2>
          <PieceList pieces={pending} onSelect={setSelected} />
        </section>
      )}

      <section>
        <h2 className="mb-2.5 text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          Todo el calendario
        </h2>
        {rest.length === 0 && pending.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Todavía no hay contenido compartido para revisar.
          </p>
        ) : (
          <PieceList pieces={rest} onSelect={setSelected} />
        )}
      </section>

      {selected && <PieceDetail piece={selected} slug={slug} onClose={closeDetail} />}
    </div>
  );
}

function PieceList({ pieces, onSelect }: { pieces: ClientPiece[]; onSelect: (p: ClientPiece) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {pieces.map((p) => (
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
  );
}
