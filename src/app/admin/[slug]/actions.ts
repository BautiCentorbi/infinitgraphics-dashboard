"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type NoteFormState = { error: string | null };

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
