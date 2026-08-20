export function ComingSoon({
  icon,
  title,
  description,
  bullets,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-10 py-16 text-center">
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px]"
        style={{ background: "var(--surface-2)", color: "var(--sky)" }}
      >
        {icon}
      </div>
      <span
        className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase"
        style={{ background: "oklch(0.78 0.17 65 / 0.14)", color: "var(--amber)" }}
      >
        Próximamente
      </span>
      <h1 className="mb-2.5 text-2xl font-bold tracking-tight font-display">{title}</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-dim)" }}>
        {description}
      </p>
      <ul className="surface mx-auto flex max-w-md flex-col gap-2 rounded-[16px] p-4 text-left text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5" style={{ color: "var(--text-dim)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0">
              <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
            </svg>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
