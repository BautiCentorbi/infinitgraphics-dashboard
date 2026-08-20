import { getInstagramSummary } from "@/lib/windsor";
import { disconnectDataConnection } from "./actions";
import { ConnectInstagram } from "./ConnectInstagram";

const IG_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect x="2" y="2" width="20" height="20" rx="6" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-[12px] px-3 py-2.5 text-center" style={{ background: "var(--surface-2)" }}>
      <p className="font-display text-lg font-bold">{value.toLocaleString("es-AR")}</p>
      <p className="text-[10.5px]" style={{ color: "var(--text-faint)" }}>{label}</p>
    </div>
  );
}

export async function InstagramSection({
  clientId,
  slug,
  connection,
}: {
  clientId: string;
  slug: string;
  connection: { id: string; externalAccountId: string; accountName: string } | null;
}) {
  if (!connection) {
    return <ConnectInstagram clientId={clientId} slug={slug} />;
  }

  let summary;
  let loadError: string | null = null;
  try {
    summary = await getInstagramSummary(connection.externalAccountId);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <section className="surface mb-8 rounded-[16px] p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: "var(--surface-2)", color: "var(--sky)" }}>
            {IG_ICON}
          </div>
          <div>
            <p className="text-sm font-bold">@{summary?.username || connection.accountName}</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>Instagram · últimos 30 días</p>
          </div>
        </div>
        <form action={async () => { "use server"; await disconnectDataConnection(connection.id, slug); }}>
          <button type="submit" className="text-xs font-semibold" style={{ color: "var(--text-faint)" }}>
            Desconectar
          </button>
        </form>
      </div>

      {loadError && (
        <p className="text-sm text-red-400">No se pudieron traer los datos de Windsor.ai ({loadError}).</p>
      )}

      {summary && (
        <>
          <div className="mb-3 flex gap-2">
            <Stat label="Seguidores" value={summary.followers} />
            <Stat label="Posts" value={summary.mediaCount} />
            <Stat label="Interacciones" value={summary.last30d.totalInteractions} />
          </div>
          <div className="mb-3.5 flex gap-3.5 text-xs" style={{ color: "var(--text-dim)" }}>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {summary.last30d.likes.toLocaleString("es-AR")}
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {summary.last30d.comments.toLocaleString("es-AR")}
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              {summary.last30d.views.toLocaleString("es-AR")}
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {summary.last30d.saves.toLocaleString("es-AR")}
            </span>
          </div>

          {summary.recentPosts.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {summary.recentPosts.map((p) => (
                <a
                  key={p.permalink}
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px]"
                  style={{ background: "var(--surface-2)" }}
                >
                  {p.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/60 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <span>{p.likes} likes</span>
                    <span>{p.comments} coment.</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
