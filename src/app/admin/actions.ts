"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, RESERVED_SLUGS } from "@/lib/slug";
import { requireAdminSession, requireClientAccess } from "@/lib/access";
import { notifyOwnersOfClientRequest } from "@/lib/email";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export type ClientFormState = { error: string | null; requested?: boolean };

async function uniqueSlugFor(name: string): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;
  while (RESERVED_SLUGS.includes(slug) || (await prisma.client.findUnique({ where: { slug } }))) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
  return slug;
}

// Crea un cliente nuevo — o, si quien lo pide es un admin acotado sin
// permiso (User.canCreateClients), deja un ClientRequest pendiente y avisa
// por mail al owner en vez de crearlo directo (ver CLAUDE.md,
// "Administradores acotados", 2026-09-04). El owner siempre puede crear
// directo. El slug se genera a partir del nombre; si ya existe (nombre
// repetido o slug colisionando), se le agrega un sufijo numérico para que
// siempre quede único sin tener que pedirle el slug a mano.
export async function createClient(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const session = await requireAdminSession();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "El nombre es obligatorio." };

  if (session.role === "admin") {
    const me = await prisma.user.findUnique({ where: { id: session.id }, select: { canCreateClients: true } });
    if (!me?.canCreateClients) {
      await prisma.clientRequest.create({ data: { name, requestedById: session.id } });
      notifyOwnersOfClientRequest({ requesterEmail: session.email, clientName: name }).catch(() => {});
      revalidatePath("/admin");
      return { error: null, requested: true };
    }
  }

  const baseSlug = slugify(name);
  if (!baseSlug) return { error: "Ese nombre no genera un slug válido." };
  const slug = await uniqueSlugFor(name);

  const client = await prisma.client.create({ data: { name, slug } });

  // Si quien lo crea es un admin acotado (con permiso), se auto-asigna el
  // cliente que acaba de crear — si no, lo crearía y no podría verlo.
  if (session.role === "admin") {
    await prisma.adminClientAccess.create({ data: { userId: session.id, clientId: client.id } });
  }

  revalidatePath("/admin");
  return { error: null };
}

// Renombra un cliente. El slug NO se toca al renombrar — cambiarlo rompería
// logins de clientes ya creados que apunten a ese slug (ver
// ARCHITECTURE.md, session.user.clientSlug). Un admin acotado puede
// renombrar los clientes que tiene asignados (no es una acción destructiva).
export async function renameClient(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string | null)?.trim();
  if (!id || !name) return;
  await requireClientAccess(id);

  await prisma.client.update({ where: { id }, data: { name } });
  revalidatePath("/admin");
}

// La foto ya está en Blob cuando esto se llama (subida directo desde el
// navegador, ver api/avatar/upload) — esto guarda la URL y borra la vieja
// si había una (evita ir acumulando fotos huérfanas en el store).
export async function updateClientAvatar(clientId: string, avatarUrl: string) {
  await requireClientAccess(clientId);
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { avatarUrl: true } });
  await prisma.client.update({ where: { id: clientId }, data: { avatarUrl } });
  if (client?.avatarUrl) await del(client.avatarUrl).catch(() => {});
  revalidatePath("/admin");
}

export async function removeClientAvatar(clientId: string) {
  await requireClientAccess(clientId);
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { avatarUrl: true } });
  await prisma.client.update({ where: { id: clientId }, data: { avatarUrl: null } });
  if (client?.avatarUrl) await del(client.avatarUrl).catch(() => {});
  revalidatePath("/admin");
}

// Borrar un cliente es destructivo (cascada sobre notas/tareas/contenido/
// accesos) — reservado al owner, a diferencia de renombrar/avatar.
export async function deleteClient(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const session = await requireAdminSession();
  if (session.role !== "owner") return;

  // onDelete: Cascade en el schema se encarga de notas/tareas/contenido de
  // ese cliente — ver prisma/schema.prisma.
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin");
}
