"use client";

import { useActionState, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  createContentPiece,
  updateContentPiece,
  deleteContentPiece,
  addAdminComment,
  type PieceFormState,
} from "./actions";
import { PLATFORMS, PLATFORM_LABELS, FORMATS, FORMAT_LABELS } from "@/lib/content";
import { StatusPicker } from "./StatusPicker";
import type { ContentStatus } from "@/generated/prisma/enums";
import type { Piece, TopicOption } from "./types";

const initialState: PieceFormState = { error: null };
const inputCls = "rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";
const labelCls = "flex flex-col gap-1.5 text-xs font-semibold";

export function PieceModal({
  clientId,
  slug,
  topics,
  piece,
  defaultDate,
  onClose,
}: {
  clientId: string;
  slug: string;
  topics: TopicOption[];
  piece: Piece | null; // null = modo creación
  defaultDate?: string;
  onClose: () => void;
}) {
  const action = piece ? updateContentPiece : createContentPiece;
  const [state, formAction, pending] = useActionState(async (prev: PieceFormState, fd: FormData) => {
    const result = await action(prev, fd);
    if (!result.error) onClose();
    return result;
  }, initialState);

  // El StatusPicker no es un <select> nativo, así que no manda su valor
  // solo — lo llevamos en estado y lo mandamos con un input hidden, para
  // que se guarde junto con el resto de los campos al tocar "Guardar".
  const [status, setStatus] = useState<ContentStatus>(piece?.status ?? "draft");

  const commentFormRef = useRef<HTMLFormElement>(null);
  const [commentState, commentFormAction, commentPending] = useActionState(
    async (prev: PieceFormState, fd: FormData) => {
      const result = await addAdminComment(prev, fd);
      if (!result.error) commentFormRef.current?.reset();
      return result;
    },
    initialState
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-20 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(2px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[18px] border p-6.5"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface)", boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.6)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold font-display">{piece ? "Editar pieza" : "Nueva pieza"}</h2>
          <button onClick={onClose} className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px]" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>
            ✕
          </button>
        </div>

        <form id="piece-form" action={formAction} className="flex flex-col gap-3.5">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="slug" value={slug} />
          {piece && <input type="hidden" name="id" value={piece.id} />}

          <label className={labelCls} style={{ color: "var(--text-dim)" }}>
            Título
            <input name="title" defaultValue={piece?.title} required className={inputCls} style={{ borderColor: "var(--border)" }} />
          </label>

          <div className="flex gap-3">
            <label className={`flex-1 ${labelCls}`} style={{ color: "var(--text-dim)" }}>
              Plataforma
              <select name="platform" defaultValue={piece?.platform ?? "instagram"} className={inputCls} style={{ borderColor: "var(--border)" }}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>

            <label className={`flex-1 ${labelCls}`} style={{ color: "var(--text-dim)" }}>
              Formato <span className="font-normal normal-case" style={{ color: "var(--text-faint)" }}>(opcional)</span>
              <select name="format" defaultValue={piece?.format ?? ""} className={inputCls} style={{ borderColor: "var(--border)" }}>
                <option value="">Sin definir</option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <label className={`flex-1 ${labelCls}`} style={{ color: "var(--text-dim)" }}>
              Fecha
              <input
                name="scheduledDate"
                type="date"
                defaultValue={piece?.scheduledDate.slice(0, 10) ?? defaultDate}
                required
                className={inputCls}
                style={{ borderColor: "var(--border)", colorScheme: "dark" }}
              />
            </label>

            <label className={`flex-1 ${labelCls}`} style={{ color: "var(--text-dim)" }}>
              Tema <span className="font-normal normal-case" style={{ color: "var(--text-faint)" }}>(opcional)</span>
              <select name="topicId" defaultValue={piece?.topicId ?? ""} className={inputCls} style={{ borderColor: "var(--border)" }}>
                <option value="">Sin tema</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {piece && (
            <div className={labelCls} style={{ color: "var(--text-dim)" }}>
              Estado
              <input type="hidden" name="status" value={status} />
              <StatusPicker value={status} onChange={setStatus} />
            </div>
          )}

          <label className={labelCls} style={{ color: "var(--text-dim)" }}>
            Copy
            <textarea name="copy" defaultValue={piece?.copy} rows={4} className={inputCls} style={{ borderColor: "var(--border)" }} />
          </label>

          <label className={labelCls} style={{ color: "var(--text-dim)" }}>
            Hashtags <span className="font-normal normal-case" style={{ color: "var(--text-faint)" }}>(opcional)</span>
            <input
              name="hashtags"
              defaultValue={piece?.hashtags ?? ""}
              placeholder="#moda #verano"
              className={inputCls}
              style={{ borderColor: "var(--border)" }}
            />
          </label>

          <label className={labelCls} style={{ color: "var(--text-dim)" }}>
            URL de imagen/video <span className="font-normal normal-case" style={{ color: "var(--text-faint)" }}>(opcional)</span>
            <input
              name="mediaUrl"
              defaultValue={piece?.mediaUrl ?? ""}
              placeholder="https://..."
              className={inputCls}
              style={{ borderColor: "var(--border)" }}
            />
          </label>

          <label className={labelCls} style={{ color: "var(--amber)" }}>
            Notas internas <span className="font-normal normal-case" style={{ color: "var(--text-faint)" }}>(opcional — solo vos la ves, el cliente no)</span>
            <textarea
              name="internalNotes"
              defaultValue={piece?.internalNotes ?? ""}
              rows={2}
              placeholder="Recordatorios de producción, pendientes..."
              className={inputCls}
              style={{ borderColor: "var(--border)" }}
            />
          </label>

          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        </form>

        {/* Fuera del <form> principal a propósito: HTML no permite forms
            anidados, y "Borrar" es una acción independiente de "Guardar"
            (ver bug reportado por Bautista, hydration error de <form> en
            <form>). El botón "Guardar" usa el atributo form= para seguir
            enviando el form principal desde acá afuera. */}
        <div className="mt-3 flex items-center justify-between">
          {piece ? (
            <form
              action={async (fd) => {
                await deleteContentPiece(fd);
                onClose();
              }}
            >
              <input type="hidden" name="id" value={piece.id} />
              <input type="hidden" name="slug" value={slug} />
              <button type="submit" className="text-sm font-semibold text-red-400">
                Borrar
              </button>
            </form>
          ) : (
            <span />
          )}
          <button type="submit" form="piece-form" disabled={pending} className="btn-grad">
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {piece && (
          <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="mb-2.5 text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
              Comentarios{piece.comments.length > 0 && ` (${piece.comments.length})`}
            </h3>
            <div className="flex flex-col gap-2">
              {piece.comments.map((c) => (
                <div
                  key={c.id}
                  className="max-w-[82%] rounded-[13px] px-3.5 py-2.5 text-[12.5px]"
                  style={
                    c.authorRole === "client"
                      ? { background: "var(--surface-2)", borderBottomLeftRadius: 3 }
                      : { background: "var(--grad)", color: "white", marginLeft: "auto", borderBottomRightRadius: 3 }
                  }
                >
                  <p className="mb-0.5 text-[10px] font-bold opacity-70">
                    {c.authorRole === "client" ? "Cliente" : "Vos"} · {new Date(c.createdAt).toLocaleString("es-AR")}
                  </p>
                  <p className="whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
              {piece.comments.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-faint)" }}>Sin comentarios todavía.</p>
              )}
            </div>

            <form ref={commentFormRef} action={commentFormAction} className="mt-3.5 flex flex-col gap-2">
              <input type="hidden" name="pieceId" value={piece.id} />
              <input type="hidden" name="slug" value={slug} />
              <textarea
                name="body"
                placeholder="Responder al cliente..."
                rows={2}
                className={inputCls}
                style={{ borderColor: "var(--border)" }}
              />
              <button type="submit" disabled={commentPending} className="btn-grad self-start">
                {commentPending ? "Enviando..." : "Comentar"}
              </button>
              {commentState.error && <p className="text-sm text-red-400">{commentState.error}</p>}
            </form>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
