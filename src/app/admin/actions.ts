"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export type ClientFormState = { error: string | null };

// Crea un cliente nuevo. El slug se genera a partir del nombre; si ya existe
// (nombre repetido o slug colisionando), se le agrega un sufijo numérico
// para que siempre quede único sin tener que pedirle el slug a mano al CM.
export async function createClient(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const baseSlug = slugify(name);
  if (!baseSlug) return { error: "Ese nombre no genera un slug válido." };

  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.client.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.client.create({ data: { name, slug } });
  revalidatePath("/admin");
  return { error: null };
}

// Renombra un cliente. El slug NO se toca al renombrar — cambiarlo rompería
// logins de clientes ya creados que apunten a ese slug (ver
// ARCHITECTURE.md, session.user.clientSlug).
export async function renameClient(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string | null)?.trim();
  if (!id || !name) return;

  await prisma.client.update({ where: { id }, data: { name } });
  revalidatePath("/admin");
}

export async function deleteClient(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  // onDelete: Cascade en el schema se encarga de notas/tareas/contenido de
  // ese cliente — ver prisma/schema.prisma.
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin");
}
