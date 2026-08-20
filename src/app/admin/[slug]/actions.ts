"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { TaskPriority } from "@/generated/prisma/enums";

export type NoteFormState = { error: string | null };

export type ClientUserFormState = { error: string | null };

// Crea el login de un cliente (role=client, atado a este Client). Puede
// haber más de uno por cliente (ej. dos personas del lado del cliente que
// necesiten entrar). Ver ARCHITECTURE.md, "Roles y acceso".
export async function createClientUser(
  _prevState: ClientUserFormState,
  formData: FormData
): Promise<ClientUserFormState> {
  const clientId = formData.get("clientId") as string;
  const slug = formData.get("slug") as string;
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!email) return { error: "El email es obligatorio." };
  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe un usuario con ese email." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, role: "client", clientId },
  });

  revalidatePath(`/admin/${slug}`);
  return { error: null };
}

export async function deleteClientUser(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath(`/admin/${slug}`);
}

export async function createNote(
  _prevState: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const clientId = formData.get("clientId") as string;
  const slug = formData.get("slug") as string;
  const title = (formData.get("title") as string | null)?.trim();
  const body = (formData.get("body") as string | null) ?? "";

  if (!title) return { error: "El título es obligatorio." };

  await prisma.note.create({ data: { clientId, title, body } });
  revalidatePath(`/admin/${slug}`);
  return { error: null };
}

export async function updateNote(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const title = (formData.get("title") as string | null)?.trim();
  const body = (formData.get("body") as string | null) ?? "";
  if (!id || !title) return;

  await prisma.note.update({ where: { id }, data: { title, body } });
  revalidatePath(`/admin/${slug}`);
}

export async function deleteNote(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  await prisma.note.delete({ where: { id } });
  revalidatePath(`/admin/${slug}`);
}

export type TaskFormState = { error: string | null };

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const clientId = formData.get("clientId") as string;
  const slug = formData.get("slug") as string;
  const title = (formData.get("title") as string | null)?.trim();
  const dueDateRaw = formData.get("dueDate") as string | null;
  const priority = (formData.get("priority") as TaskPriority | null) || "medium";

  if (!title) return { error: "El título es obligatorio." };

  await prisma.task.create({
    data: {
      clientId,
      title,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      priority,
    },
  });
  revalidatePath(`/admin/${slug}`);
  return { error: null };
}

export async function toggleTask(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const done = formData.get("done") === "true";
  if (!id) return;

  await prisma.task.update({ where: { id }, data: { done: !done } });
  revalidatePath(`/admin/${slug}`);
}

export async function setTaskPriority(id: string, slug: string, priority: TaskPriority) {
  await prisma.task.update({ where: { id }, data: { priority } });
  revalidatePath(`/admin/${slug}`);
}

export async function deleteTask(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  await prisma.task.delete({ where: { id } });
  revalidatePath(`/admin/${slug}`);
}

// El archivo ya está en Blob cuando esto se llama (subido directo desde el
// navegador, ver src/app/api/documents/upload/route.ts) — esto solo crea el
// registro en la base con los metadatos.
export async function createDocumentRecord({
  clientId,
  slug,
  title,
  description,
  fileUrl,
  fileName,
  fileSize,
  mimeType,
}: {
  clientId: string;
  slug: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const doc = await prisma.document.create({
    data: {
      clientId,
      title,
      description: description || null,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      uploadedById: session.user.id,
    },
  });
  revalidatePath(`/admin/${slug}`);
  return doc.id;
}

export async function deleteDocument(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;

  await prisma.document.delete({ where: { id } });
  // Borrar el registro aunque falle el borrado en Blob (no dejar un doc
  // fantasma en la UI por un error transitorio de la API de Blob).
  await del(doc.fileUrl).catch(() => {});
  revalidatePath(`/admin/${slug}`);
}
