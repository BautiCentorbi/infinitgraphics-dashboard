// Aviso simple para un admin acotado: sus solicitudes de alta de cliente
// todavía pendientes de que el owner las apruebe/rechace (ver
// src/app/admin/actions.ts, createClient). Server component — no hace
// falta interactividad, solo informar.
export function MyClientRequests({ requests }: { requests: { id: string; name: string }[] }) {
  return (
    <div
      className="surface mb-7 rounded-[14px] px-4 py-3 text-sm"
      style={{ borderColor: "var(--amber)", color: "var(--text-dim)" }}
    >
      <p className="mb-1 font-semibold" style={{ color: "var(--amber)" }}>
        Pendiente de aprobación
      </p>
      <ul className="flex flex-col gap-0.5">
        {requests.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}
