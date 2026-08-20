"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { CalendarView } from "./CalendarView";
import { KanbanView } from "./KanbanView";
import { ListView } from "./ListView";
import { PieceModal } from "./PieceModal";
import { TopicManager } from "./TopicManager";
import { reschedulePiece, changePieceStatus } from "./actions";
import type { ContentStatus } from "@/generated/prisma/enums";
import type { Piece, TopicOption } from "./types";

type View = "calendar" | "list" | "kanban";

export function CalendarApp({
  clientId,
  slug,
  initialPieces,
  initialTopics,
}: {
  clientId: string;
  slug: string;
  initialPieces: Piece[];
  initialTopics: TopicOption[];
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("calendar");
  const [pieces, setPieces] = useState(initialPieces);

  // router.refresh() vuelve a ejecutar el server component padre y nos pasa
  // un initialPieces nuevo — sincronizamos el estado optimista local con eso
  // para no quedar desalineados con lo que hay en la base.
  useEffect(() => {
    setPieces(initialPieces);
  }, [initialPieces]);
  const [modal, setModal] = useState<
    { mode: "create"; defaultDate?: string } | { mode: "edit"; piece: Piece } | null
  >(null);

  function closeModal() {
    setModal(null);
    router.refresh();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const pieceId = active.id as string;
    const overId = over.id as string;

    if (view === "calendar") {
      // over.id es una fecha "yyyy-mm-dd"
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece || piece.scheduledDate.slice(0, 10) === overId) return;

      setPieces((prev) =>
        prev.map((p) => (p.id === pieceId ? { ...p, scheduledDate: overId } : p))
      );
      await reschedulePiece(pieceId, slug, overId);
      router.refresh();
    }

    if (view === "kanban" && overId.startsWith("status:")) {
      const status = overId.replace("status:", "") as ContentStatus;
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece || piece.status === status) return;

      setPieces((prev) => prev.map((p) => (p.id === pieceId ? { ...p, status } : p)));
      await changePieceStatus(pieceId, slug, status);
      router.refresh();
    }
  }

  const tabs: { key: View; label: string }[] = [
    { key: "calendar", label: "Calendario" },
    { key: "kanban", label: "Kanban" },
    { key: "list", label: "Lista" },
  ];
  const TAB_W = 108;
  const activeIdx = tabs.findIndex((t) => t.key === view);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="tabs">
          <div className="tab-indicator" style={{ width: TAB_W, transform: `translateX(${activeIdx * TAB_W}px)` }} />
          {tabs.map((t) => (
            <div key={t.key} className="tab" data-active={view === t.key} style={{ width: TAB_W, textAlign: "center" }} onClick={() => setView(t.key)}>
              {t.label}
            </div>
          ))}
        </div>
        <button onClick={() => setModal({ mode: "create" })} className="btn-grad">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Nueva pieza
        </button>
      </div>

      <TopicManager clientId={clientId} slug={slug} topics={initialTopics} />

      <DndContext onDragEnd={handleDragEnd}>
        {view === "calendar" && (
          <CalendarView
            pieces={pieces}
            onPieceClick={(p) => setModal({ mode: "edit", piece: p })}
            onEmptyClick={(dateKey) => setModal({ mode: "create", defaultDate: dateKey })}
          />
        )}
        {view === "kanban" && (
          <KanbanView pieces={pieces} onPieceClick={(p) => setModal({ mode: "edit", piece: p })} />
        )}
      </DndContext>

      {view === "list" && (
        <ListView
          pieces={pieces}
          topics={initialTopics}
          onPieceClick={(p) => setModal({ mode: "edit", piece: p })}
        />
      )}

      {modal && (
        <PieceModal
          clientId={clientId}
          slug={slug}
          topics={initialTopics}
          piece={modal.mode === "edit" ? modal.piece : null}
          defaultDate={modal.mode === "create" ? modal.defaultDate : undefined}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
