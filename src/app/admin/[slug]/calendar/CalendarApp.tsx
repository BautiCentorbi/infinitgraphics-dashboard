"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { CalendarView } from "./CalendarView";
import { KanbanView } from "./KanbanView";
import { ListView } from "./ListView";
import { PieceModal } from "./PieceModal";
import { PiecePreview } from "./PiecePreview";
import { FilterBar } from "./FilterBar";
import { CardFieldsMenu, useCardFields } from "./CardFieldsMenu";
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
  const { fields: cardFields, toggle: toggleCardField } = useCardFields(slug);

  // router.refresh() vuelve a ejecutar el server component padre y nos pasa
  // un initialPieces nuevo — sincronizamos el estado optimista local con eso
  // para no quedar desalineados con lo que hay en la base.
  useEffect(() => {
    setPieces(initialPieces);
  }, [initialPieces]);

  const [modal, setModal] = useState<
    { mode: "create"; defaultDate?: string } | { mode: "edit"; piece: Piece } | null
  >(null);

  // Filtros por propiedades, compartidos por las 3 vistas.
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const filteredPieces = useMemo(
    () =>
      pieces
        .filter((p) => !platformFilter || p.platform === platformFilter)
        .filter((p) => !statusFilter || p.status === statusFilter)
        .filter((p) => !topicFilter || p.topicId === topicFilter),
    [pieces, platformFilter, statusFilter, topicFilter]
  );

  // Preview al hover: Calendario/Kanban muestran el detalle completo sin
  // click, con delay de entrada/salida para que no titile al pasar el
  // mouse y para poder mover el cursor hacia el propio popover (el botón
  // "Editar" vive ahí).
  const [preview, setPreview] = useState<{ piece: Piece; rect: DOMRect } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showPreview(piece: Piece, rect: DOMRect) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setPreview({ piece, rect });
  }
  function scheduleHidePreview() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPreview(null), 150);
  }
  function cancelHidePreview() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }

  // Click en una pieza desde Calendario/Kanban: navega a la Lista y la
  // resalta ahí, en vez de abrir el modal de edición directo — para editar
  // se usa el botón "Editar" del preview al hover, o el click desde la
  // propia Lista.
  const [highlightId, setHighlightId] = useState<string | null>(null);
  function jumpToList(piece: Piece) {
    setPreview(null);
    setView("list");
    setHighlightId(piece.id);
  }

  function openEdit(piece: Piece) {
    setPreview(null);
    setModal({ mode: "edit", piece });
  }

  // Cambio de estado directo desde el StatusPicker — disponible en el
  // popover de hover, la vista Lista y el modal de edición, no hace falta
  // arrastrar en el kanban para esto.
  async function handleStatusChange(pieceId: string, status: ContentStatus) {
    setPieces((prev) => prev.map((p) => (p.id === pieceId ? { ...p, status } : p)));
    setPreview((prev) => (prev && prev.piece.id === pieceId ? { ...prev, piece: { ...prev.piece, status } } : prev));
    await changePieceStatus(pieceId, slug, status);
    router.refresh();
  }

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
            <div
              key={t.key}
              className="tab"
              data-active={view === t.key}
              style={{ width: TAB_W, textAlign: "center" }}
              onClick={() => setView(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setModal({ mode: "create" })} className="btn-grad">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva pieza
        </motion.button>
      </div>

      <TopicManager clientId={clientId} slug={slug} topics={initialTopics} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterBar
          topics={initialTopics}
          platformFilter={platformFilter}
          statusFilter={statusFilter}
          topicFilter={topicFilter}
          onPlatformChange={setPlatformFilter}
          onStatusChange={setStatusFilter}
          onTopicChange={setTopicFilter}
        />
        {view !== "list" && <CardFieldsMenu fields={cardFields} onToggle={toggleCardField} />}
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        {view === "calendar" && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <CalendarView
              pieces={filteredPieces}
              onPieceClick={jumpToList}
              onEmptyClick={(dateKey) => setModal({ mode: "create", defaultDate: dateKey })}
              onHoverStart={showPreview}
              onHoverEnd={scheduleHidePreview}
              cardFields={cardFields}
            />
          </motion.div>
        )}
        {view === "kanban" && (
          <motion.div key="kanban" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <KanbanView
              pieces={filteredPieces}
              onPieceClick={jumpToList}
              onHoverStart={showPreview}
              onHoverEnd={scheduleHidePreview}
              cardFields={cardFields}
            />
          </motion.div>
        )}
      </DndContext>

      {view === "list" && (
        <motion.div key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <ListView
            pieces={filteredPieces}
            onPieceClick={openEdit}
            onChangeStatus={handleStatusChange}
            highlightId={highlightId}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {preview && (
          <PiecePreview
            key={preview.piece.id}
            piece={preview.piece}
            anchorRect={preview.rect}
            onEdit={() => openEdit(preview.piece)}
            onChangeStatus={(status) => handleStatusChange(preview.piece.id, status)}
            onMouseEnter={cancelHidePreview}
            onMouseLeave={scheduleHidePreview}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <PieceModal
            key={modal.mode === "edit" ? modal.piece.id : "new"}
            clientId={clientId}
            slug={slug}
            topics={initialTopics}
            piece={modal.mode === "edit" ? modal.piece : null}
            defaultDate={modal.mode === "create" ? modal.defaultDate : undefined}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
