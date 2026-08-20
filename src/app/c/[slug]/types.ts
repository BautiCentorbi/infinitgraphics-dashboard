import type { Platform, ContentStatus } from "@/generated/prisma/enums";

export type PieceComment = {
  id: string;
  body: string;
  createdAt: string; // ISO
  authorEmail: string;
  authorRole: "admin" | "client";
};

export type ClientPiece = {
  id: string;
  title: string;
  platform: Platform;
  scheduledDate: string; // ISO
  copy: string;
  hashtags: string | null;
  mediaUrl: string | null;
  status: ContentStatus;
  topicName: string | null;
  comments: PieceComment[];
};
