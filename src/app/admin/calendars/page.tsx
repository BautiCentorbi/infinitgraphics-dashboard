import { ComingSoon } from "@/components/ComingSoon";

export default function CalendarsOverviewPage() {
  return (
    <ComingSoon
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      }
      title="Calendarios"
      description="Una vista general de todo el contenido de todos los clientes en un mismo lugar, con filtro por cliente — hoy cada calendario vive dentro de su cliente en particular."
      bullets={[
        "Todas las piezas de todos los clientes, con filtro por cliente/plataforma/estado",
        "Pensada para el día a día del CM manejando varias cuentas a la vez",
        "El calendario por cliente (dentro de cada workspace) sigue siendo la vista de trabajo",
      ]}
    />
  );
}
