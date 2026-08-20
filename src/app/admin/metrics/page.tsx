import { ComingSoon } from "@/components/ComingSoon";

export default function MetricsPage() {
  return (
    <ComingSoon
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M3 3v18h18" />
          <path d="M18 17V9M13 17V5M8 17v-4" />
        </svg>
      }
      title="Métricas"
      description="El pilar de analytics: conectar Instagram, Google Ads y Meta Ads por cliente para ver métricas y tendencias reales, no solo lo que se planificó."
      bullets={[
        "Conexión de cuentas por cliente (vía Windsor.ai, ya disponible en este entorno)",
        "Métricas de alcance, interacción y conversión por plataforma",
        "Comparar lo publicado (calendario) contra cómo funcionó de verdad",
      ]}
    />
  );
}
