"use client";

import { useActionState, useRef, useTransition } from "react";
import { addComment, clientApprove, clientRequestChanges, type CommentFormState } from "./actions";
import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS } from "@/lib/content";
import type { ClientPiece } from "./types";

const initialState: CommentFormState = { error: null };
const inputCls = "rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

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

  // El cliente puede aprobar/pedir cambios en cualquier estado previo a
  // "publicado" — incluido "programado" (todavía se puede frenar/corregir
  // antes de que salga). En "aprobado" y "publicado" solo puede comentar.
  // "borrador" nunca llega acá — el cliente ni lo ve (ver /c/[slug]/page.tsx).
  const canReview =
    piece.status === "in_review" || piece.status === "changes_requested" || piece.status === "scheduled";

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4" style={{ background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(2px)" }}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[18px] border p-6.5"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface)", boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.6)" }}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-display">{piece.title}</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-faint)" }}>
              {PLATFORM_LABELS[piece.platform]} · {new Date(piece.scheduledDate).toLocaleDateString("es-AR")}
              {piece.topicName && ` · ${piece.topicName}`}
            </p>
          </div>
          <button onClick={onClose} className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-[9px]" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>
            ✕
          </button>
        </div>

        <span className={`status-pill ${STATUS_CLASS[piece.status]}`}>
          <span className="d" />
          {STATUS_LABELS[piece.status]}
        </span>

        {piece.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={piece.mediaUrl} alt="" className="mt-3.5 max-h-64 w-full rounded-[14px] object-cover" />
        )}

        <p className="mt-3.5 text-[13.5px] whitespace-pre-wrap" style={{ color: "var(--text-dim)" }}>{piece.copy}</p>
        {piece.hashtags && <p className="mt-2 text-sm" style={{ color: "var(--sky)" }}>{piece.hashtags}</p>}

        {canReview && (
          <div className="mt-4.5 flex gap-2">
            <button
              disabled={pending}
              onClick={() => startTransition(() => clientApprove(piece.id, slug))}
              className="flex-1 rounded-[11px] py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--teal), oklch(0.78 0.13 165))", color: "oklch(0.14 0.03 165)" }}
            >
              ✓ Aprobar
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => clientRequestChanges(piece.id, slug))}
              className="flex-1 rounded-[11px] border py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ borderColor: "oklch(0.78 0.17 65 / 0.4)", background: "oklch(0.78 0.17 65 / 0.14)", color: "oklch(0.87 0.1 65)" }}
            >
              Pedir cambios
            </button>
          </div>
        )}

        <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <h3 className="mb-2.5 text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
            Comentarios
          </h3>
          <div className="flex flex-col gap-2">
            {piece.comments.map((c) => (
              <div
                key={c.id}
                className="max-w-[82%] rounded-[13px] px-3.5 py-2.5 text-[12.5px]"
                style={
                  c.authorRole === "admin"
                    ? { background: "var(--surface-2)", borderBottomLeftRadius: 3 }
                    : { background: "var(--grad)", color: "white", marginLeft: "auto", borderBottomRightRadius: 3 }
                }
              >
                <p className="mb-0.5 text-[10px] font-bold opacity-70">
                  {c.authorRole === "admin" ? "Community Manager" : "Vos"} · {new Date(c.createdAt).toLocaleString("es-AR")}
                </p>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
            {piece.comments.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>Sin comentarios todavía.</p>
            )}
          </div>

          <form ref={formRef} action={formAction} className="mt-3.5 flex flex-col gap-2">
            <input type="hidden" name="pieceId" value={piece.id} />
            <input type="hidden" name="slug" value={slug} />
            <textarea name="body" placeholder="Escribí un comentario..." rows={2} className={inputCls} style={{ borderColor: "var(--border)" }} />
            <button type="submit" disabled={commentPending} className="btn-grad self-start">
              {commentPending ? "Enviando..." : "Comentar"}
            </button>
            {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
