const ICONS = {
  pieces: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
};

function Tile({ label, value, icon }: { label: string; value: number; icon: keyof typeof ICONS }) {
  return (
    <div className="surface card-anim flex items-center gap-3 rounded-[16px] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "var(--surface-2)", color: "var(--sky)" }}>
        {ICONS[icon]}
      </div>
      <div>
        <p className="font-display text-xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export function StatTiles({
  totalPieces,
  pendingReview,
  pendingTasks,
  totalDocs,
}: {
  totalPieces: number;
  pendingReview: number;
  pendingTasks: number;
  totalDocs: number;
}) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label="Piezas de contenido" value={totalPieces} icon="pieces" />
      <Tile label="Pendientes de revisión" value={pendingReview} icon="review" />
      <Tile label="Tareas pendientes" value={pendingTasks} icon="tasks" />
      <Tile label="Documentos" value={totalDocs} icon="docs" />
    </div>
  );
}
