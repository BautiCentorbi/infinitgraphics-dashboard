"use client";

import { useActionState } from "react";
import { createContentPiece, updateContentPiece, deleteContentPiece, type PieceFormState } from "./actions";
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

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{piece ? "Editar pieza" : "Nueva pieza"}</h2>
          <button onClick={onClose} className="text-black/50 dark:text-white/50">
            ✕
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
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
              disabled={pending}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {pending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
