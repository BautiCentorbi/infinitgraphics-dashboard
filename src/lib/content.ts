import type { Platform, ContentStatus } from "@/generated/prisma/enums";

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  otro: "Otro",
};

export const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

// Orden fijo de columnas del kanban y de progreso del flujo de aprobación.
export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  changes_requested: "Cambios pedidos",
  approved: "Aprobado",
  scheduled: "Programado",
  published: "Publicado",
};

export const STATUSES = Object.keys(STATUS_LABELS) as ContentStatus[];

// Nombre de clase CSS por status — ver .status-* en globals.css (celeste =
// en revisión, ámbar = cambios pedidos, teal = aprobado, azul = programado).
export const STATUS_CLASS: Record<ContentStatus, string> = {
  draft: "status-draft",
  in_review: "status-in_review",
  changes_requested: "status-changes_requested",
  approved: "status-approved",
  scheduled: "status-scheduled",
  published: "status-published",
};
