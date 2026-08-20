"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Platform, ContentStatus } from "@/generated/prisma/enums";

export type PieceFormState = { error: string | null };

function readPieceFields(formData: FormData) {
  const title = (formData.get("title") as string | null)?.trim();
  const platform = formData.get("platform") as Platform;
  const scheduledDateRaw = formData.get("scheduledDate") as string;
  const copy = (formData.get("copy") as string | null) ?? "";
  const hashtags = (formData.get("hashtags") as string | null)?.trim() || null;
  const mediaUrl = (formData.get("mediaUrl") as string | null)?.trim() || null;
  const topicId = (formData.get("topicId") as string | null) || null;
  return { title, platform, scheduledDateRaw, copy, hashtags, mediaUrl, topicId };
}

export async function createContentPiece(
  _prevState: PieceFormState,
  formData: FormData
): Promise<PieceFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesión inválida." };

  const clientId = formData.get("clientId") as string;
  const slug = formData.get("slug") as string;
  const { title, platform, scheduledDateRaw, copy, hashtags, mediaUrl, topicId } =
    readPieceFields(formData);

  if (!title) return { error: "El título es obligatorio." };
  if (!scheduledDateRaw) return { error: "La fecha es obligatoria." };

  await prisma.contentPiece.create({
    data: {
      clientId,
      title,
      platform,
      scheduledDate: new Date(scheduledDateRaw),
      copy,
      hashtags,
      mediaUrl,
      topicId,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/admin/${slug}/calendar`);
  return { error: null };
}

export async function updateContentPiece(
  _prevState: PieceFormState,
  formData: FormData
): Promise<PieceFormState> {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const { title, platform, scheduledDateRaw, copy, hashtags, mediaUrl, topicId } =
    readPieceFields(formData);

  if (!title) return { error: "El título es obligatorio." };
  if (!scheduledDateRaw) return { error: "La fecha es obligatoria." };

  await prisma.contentPiece.update({
    where: { id },
    data: {
      title,
      platform,
      scheduledDate: new Date(scheduledDateRaw),
      copy,
      hashtags,
      mediaUrl,
      topicId,
    },
  });

  revalidatePath(`/admin/${slug}/calendar`);
  return { error: null };
}

// Usado por el drag & drop de la vista calendario: solo cambia la fecha.
export async function reschedulePiece(id: string, slug: string, scheduledDateISO: string) {
  await prisma.contentPiece.update({
    where: { id },
    data: { scheduledDate: new Date(scheduledDateISO) },
  });
  revalidatePath(`/admin/${slug}/calendar`);
}

// Usado por el drag & drop del kanban: cambia el status y deja registro en
// ApprovalEvent (auditoría de quién movió qué y cuándo).
export async function changePieceStatus(id: string, slug: string, status: ContentStatus) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.$transaction([
    prisma.contentPiece.update({ where: { id }, data: { status } }),
    prisma.approvalEvent.create({
      data: { contentPieceId: id, status, changedById: session.user.id },
    }),
  ]);
  revalidatePath(`/admin/${slug}/calendar`);
}

export async function deleteContentPiece(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  await prisma.contentPiece.delete({ where: { id } });
  revalidatePath(`/admin/${slug}/calendar`);
}

export async function createTopic(
  _prevState: PieceFormState,
  formData: FormData
): Promise<PieceFormState> {
  const clientId = formData.get("clientId") as string;
  const slug = formData.get("slug") as string;
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const existing = await prisma.topic.findUnique({
    where: { clientId_name: { clientId, name } },
  });
  if (existing) return { error: "Ya existe un tema con ese nombre." };

  await prisma.topic.create({ data: { clientId, name } });
  revalidatePath(`/admin/${slug}/calendar`);
  return { error: null };
}

export async function deleteTopic(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  await prisma.topic.delete({ where: { id } });
  revalidatePath(`/admin/${slug}/calendar`);
}
