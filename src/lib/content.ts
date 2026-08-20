import type { Platform, ContentStatus, ContentFormat } from "@/generated/prisma/enums";

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

// Formato de la pieza — opcional (no siempre está decidido en etapa de
// borrador).
export const FORMAT_LABELS: Record<ContentFormat, string> = {
  carousel: "Carrusel",
  image_post: "Post imagen",
  reel: "Reel",
  video: "Video",
  story: "Story",
  text: "Texto",
  other: "Otro",
};

export const FORMATS = Object.keys(FORMAT_LABELS) as ContentFormat[];

// Propiedades que se pueden mostrar/ocultar en las tarjetas de
// Calendario/Kanban — configurable por el usuario (ver CardFieldsMenu).
// "title" no está acá porque siempre se muestra.
export const CARD_FIELDS = ["platform", "status", "topic", "format", "hashtags", "comments", "internalNotes"] as const;
export type CardField = (typeof CARD_FIELDS)[number];

export const CARD_FIELD_LABELS: Record<CardField, string> = {
  platform: "Plataforma",
  status: "Estado",
  topic: "Tema",
  format: "Formato",
  hashtags: "Hashtags",
  comments: "Comentarios",
  internalNotes: "Notas internas",
};

// Default razonable: lo que ya se mostraba antes de que esto fuera
// configurable.
export const DEFAULT_CARD_FIELDS: CardField[] = ["platform", "status", "topic"];
