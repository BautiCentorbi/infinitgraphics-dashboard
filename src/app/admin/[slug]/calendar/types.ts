import type { Platform, ContentStatus, ContentFormat } from "@/generated/prisma/enums";

export type PieceComment = {
  id: string;
  body: string;
  createdAt: string; // ISO
  authorEmail: string;
  authorRole: "admin" | "client";
};

// Piezas de contenido serializadas para pasar de server component a client
// component (Date -> string ISO).
export type Piece = {
  id: string;
  title: string;
  platform: Platform;
  format: ContentFormat | null;
  scheduledDate: string; // ISO
  copy: string;
  hashtags: string | null;
  mediaUrl: string | null;
  status: ContentStatus;
  internalNotes: string | null;
  topicId: string | null;
  topic: { id: string; name: string } | null;
  comments: PieceComment[];
};

export type TopicOption = { id: string; name: string };
