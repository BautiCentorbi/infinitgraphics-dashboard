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

export const STATUS_COLORS: Record<ContentStatus, string> = {
  draft: "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
  in_review: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  changes_requested: "bg-red-500/15 text-red-700 dark:text-red-300",
  approved: "bg-green-500/15 text-green-700 dark:text-green-300",
  scheduled: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  published: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
};
