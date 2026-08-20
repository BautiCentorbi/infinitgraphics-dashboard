"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

  if (!title) return { error: "El título es obligatorio." };

  await prisma.task.create({
    data: {
      clientId,
      title,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
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

export async function deleteTask(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  if (!id) return;

  await prisma.task.delete({ where: { id } });
  revalidatePath(`/admin/${slug}`);
}
