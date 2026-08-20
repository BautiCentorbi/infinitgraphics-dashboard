import Link from "next/link";
import { PLATFORM_LABELS, STATUS_CLASS, STATUS_LABELS } from "@/lib/content";
import type { Platform, ContentStatus } from "@/generated/prisma/enums";

type PreviewPiece = {
  id: string;
  title: string;
  platform: Platform;
  status: ContentStatus;
  scheduledDate: Date;
};

export function CalendarPreview({ slug, pieces }: { slug: string; pieces: PreviewPiece[] }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          Próximo contenido
        </h2>
        <Link href={`/admin/${slug}/calendar`} className="text-xs font-semibold" style={{ color: "var(--sky)" }}>
          Ver calendario →
        </Link>
      </div>

      {pieces.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Nada programado todavía.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pieces.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/${slug}/calendar`}
                className="surface surface-hover flex items-center justify-between gap-2 rounded-[12px] px-3.5 py-2.5 text-sm transition-colors"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="w-11 shrink-0 text-xs font-semibold" style={{ color: "var(--text-faint)" }}>
                    {p.scheduledDate.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="truncate font-semibold">{p.title}</span>
                  <span className="shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>
                    {PLATFORM_LABELS[p.platform]}
                  </span>
                </span>
                <span className={`status-pill shrink-0 ${STATUS_CLASS[p.status]}`}>
                  <span className="d" />
                  {STATUS_LABELS[p.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
