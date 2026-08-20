"use client";

import { useActionState, useRef } from "react";
import {
  createContentPiece,
  updateContentPiece,
  deleteContentPiece,
  addAdminComment,
  type PieceFormState,
} from "./actions";
import { PLATFORMS, PLATFORM_LABELS, STATUSES, STATUS_LABELS } from "@/lib/content";
import type { Piece, TopicOption } from "./types";

const initialState: PieceFormState = { error: null };

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
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{piece ? "Editar pieza" : "Nueva pieza"}</h2>
          <button onClick={onClose} className="text-black/50 dark:text-white/50">
            ✕
          </button>
        </div>

        <form id="piece-form" action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="slug" value={slug} />
          {piece && <input type="hidden" name="id" value={piece.id} />}

          <label className="flex flex-col gap-1 text-sm">
            Título
            <input
              name="title"
              defaultValue={piece?.title}
              required
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Plataforma
              <select
                name="platform"
                defaultValue={piece?.platform ?? "instagram"}
                className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-1 flex-col gap-1 text-sm">
              Fecha
              <input
                name="scheduledDate"
                type="date"
                defaultValue={piece?.scheduledDate.slice(0, 10) ?? defaultDate}
                required
                className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Tema
              <select
                name="topicId"
                defaultValue={piece?.topicId ?? ""}
                className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
              >
                <option value="">Sin tema</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            {piece && (
              <label className="flex flex-1 flex-col gap-1 text-sm">
                Estado
                <select
                  name="status"
                  defaultValue={piece.status}
                  disabled
                  className="rounded border border-black/20 px-3 py-2 text-black/50 dark:border-white/20 dark:text-white/50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Copy
            <textarea
              name="copy"
              defaultValue={piece?.copy}
              rows={4}
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Hashtags
            <input
              name="hashtags"
              defaultValue={piece?.hashtags ?? ""}
              placeholder="#moda #verano"
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            URL de imagen/video (opcional)
            <input
              name="mediaUrl"
              defaultValue={piece?.mediaUrl ?? ""}
              placeholder="https://..."
              className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
            />
          </label>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>

        {/* Fuera del <form> principal a propósito: HTML no permite forms
            anidados, y "Borrar" es una acción independiente de "Guardar"
            (ver bug reportado por Bautista, hydration error de <form> en
            <form>). El botón "Guardar" usa el atributo form= para seguir
            enviando el form principal desde acá afuera. */}
        <div className="mt-2 flex items-center justify-between">
          {piece ? (
            <form
              action={async (fd) => {
                await deleteContentPiece(fd);
                onClose();
              }}
            >
              <input type="hidden" name="id" value={piece.id} />
              <input type="hidden" name="slug" value={slug} />
              <button type="submit" className="text-sm text-red-600">
                Borrar
              </button>
            </form>
          ) : (
            <span />
          )}
          <button
            type="submit"
            form="piece-form"
            disabled={pending}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {piece && (
          <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/10">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
              Comentarios{piece.comments.length > 0 && ` (${piece.comments.length})`}
            </h3>
            <div className="flex flex-col gap-2">
              {piece.comments.map((c) => (
                <div key={c.id} className="rounded border border-black/10 p-2 text-sm dark:border-white/10">
                  <p className="mb-1 text-xs text-black/50 dark:text-white/50">
                    {c.authorRole === "client" ? "Cliente" : "Vos"} ·{" "}
                    {new Date(c.createdAt).toLocaleString("es-AR")}
                  </p>
                  <p className="whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
              {piece.comments.length === 0 && (
                <p className="text-sm text-black/50 dark:text-white/50">Sin comentarios todavía.</p>
              )}
            </div>

            <form ref={commentFormRef} action={commentFormAction} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="pieceId" value={piece.id} />
              <input type="hidden" name="slug" value={slug} />
              <textarea
                name="body"
                placeholder="Responder al cliente..."
                rows={2}
                className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
              />
              <button
                type="submit"
                disabled={commentPending}
                className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {commentPending ? "Enviando..." : "Comentar"}
              </button>
              {commentState.error && <p className="text-sm text-red-600">{commentState.error}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
