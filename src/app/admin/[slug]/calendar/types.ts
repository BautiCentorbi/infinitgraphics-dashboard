import type { Platform, ContentStatus } from "@/generated/prisma/enums";

// Piezas de contenido serializadas para pasar de server component a client
// component (Date -> string ISO).
export type Piece = {
  id: string;
  title: string;
  platform: Platform;
  scheduledDate: string; // ISO
  copy: string;
  hashtags: string | null;
  mediaUrl: string | null;
  status: ContentStatus;
  topicId: string | null;
  topic: { id: string; name: string } | null;
};

export type TopicOption = { id: string; name: string };
