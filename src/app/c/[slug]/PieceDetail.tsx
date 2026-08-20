"use client";

import { useActionState, useRef, useTransition } from "react";
import { addComment, clientApprove, clientRequestChanges, type CommentFormState } from "./actions";
import { PLATFORM_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/content";
import type { ClientPiece } from "./types";

const initialState: CommentFormState = { error: null };

export function PieceDetail({
  piece,
  slug,
  onClose,
}: {
  piece: ClientPiece;
  slug: string;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [state, formAction, commentPending] = useActionState(async (prev: CommentFormState, fd: FormData) => {
    const result = await addComment(prev, fd);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  const canReview = piece.status === "in_review" || piece.status === "changes_requested";

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 dark:bg-black">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{piece.title}</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              {PLATFORM_LABELS[piece.platform]} · {new Date(piece.scheduledDate).toLocaleDateString("es-AR")}
              {piece.topicName && ` · ${piece.topicName}`}
            </p>
          </div>
          <button onClick={onClose} className="text-black/50 dark:text-white/50">
            ✕
          </button>
        </div>

        <span className={`inline-block rounded px-2 py-1 text-xs ${STATUS_COLORS[piece.status]}`}>
          {STATUS_LABELS[piece.status]}
        </span>

        {piece.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={piece.mediaUrl} alt="" className="mt-3 max-h-64 w-full rounded object-cover" />
        )}

        <p className="mt-3 whitespace-pre-wrap text-sm">{piece.copy}</p>
        {piece.hashtags && (
          <p className="mt-2 text-sm text-black/50 dark:text-white/50">{piece.hashtags}</p>
        )}

        {canReview && (
          <div className="mt-4 flex gap-2">
            <button
              disabled={pending}
              onClick={() => startTransition(() => clientApprove(piece.id, slug))}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Aprobar
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => clientRequestChanges(piece.id, slug))}
              className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Pedir cambios
            </button>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
            Comentarios
          </h3>
          <div className="flex flex-col gap-2">
            {piece.comments.map((c) => (
              <div key={c.id} className="rounded border border-black/10 p-2 text-sm dark:border-white/10">
                <p className="mb-1 text-xs text-black/50 dark:text-white/50">
                  {c.authorRole === "admin" ? "Community Manager" : "Vos"} ·{" "}
                  {new Date(c.createdAt).toLocaleString("es-AR")}
                </p>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
            {piece.comments.length === 0 && (
              <p className="text-sm text-black/50 dark:text-white/50">Sin comentarios todavía.</p>
            )}
          </div>

          <form ref={formRef} action={formAction} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="pieceId" value={piece.id} />
            <input type="hidden" name="slug" value={slug} />
            <textarea
              name="body"
              placeholder="Escribí un comentario..."
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
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
