"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/access";
import { notifyNewAdmin, notifyClientRequestResolved } from "@/lib/email";
import { slugify, RESERVED_SLUGS } from "@/lib/slug";
import { generateShareToken } from "@/lib/shareToken";

export type AdminFormState = { error: string | null };

// Todo lo de este archivo es exclusivo del owner — la página y el proxy ya
// lo bloquean para admin/client (ver src/proxy.ts, src/app/admin/settings/
// page.tsx), pero cada action lo re-verifica igual: son server actions,
// invocables directo sin pasar por la página (mismo criterio que el resto
// del proyecto, ver ARCHITECTURE.md "Roles y acceso").
async function requireOwner() {
  const session = await requireAdminSession();
  if (session.role !== "owner") throw new Error("Solo el owner puede hacer esto.");
  return session;
}

// Invita un administrador acotado: por default sin ningún cliente asignado
// y sin permiso de alta directa de clientes — el owner se los da acá mismo
// al crearlo, o después editando su acceso. Ver CLAUDE.md, "Administradores
// acotados" (2026-09-04).
export async function createAdmin(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const owner = await requireOwner();

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const canCreateClients = formData.get("canCreateClients") === "on";
  const clientIds = formData.getAll("clientIds") as string[];

  if (!email) return { error: "El email es obligatorio." };
  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe un usuario con ese email." };

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "admin",
      canCreateClients,
      clientAccess: { create: clientIds.map((clientId) => ({ clientId })) },
    },
  });

  const clients = clientIds.length
    ? await prisma.client.findMany({ where: { id: { in: clientIds } }, select: { name: true } })
    : [];
  notifyNewAdmin({
    email,
    password,
    invitedByEmail: owner.email,
    clientNames: clients.map((c) => c.name),
  }).catch(() => {});

  void admin;
  revalidatePath("/admin/settings");
  return { error: null };
}

export async function deleteAdmin(formData: FormData): Promise<AdminFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: null };
  const owner = await requireOwner();

  if (id === owner.id) {
    return { error: "No podés borrar tu propio acceso desde acá." };
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "owner") {
    return { error: "No se puede borrar al owner." };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/settings");
  return { error: null };
}

// Actualiza qué clientes ve un admin acotado y si puede dar de alta
// clientes nuevos directo. Reemplaza el set completo de accesos (más simple
// que diffear) — se llama desde un form con todos los checkboxes.
export async function updateAdminAccess(formData: FormData): Promise<AdminFormState> {
  await requireOwner();

  const adminId = formData.get("adminId") as string;
  if (!adminId) return { error: null };

  const target = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
  if (!target || target.role !== "admin") return { error: "Ese usuario no es un administrador acotado." };

  const canCreateClients = formData.get("canCreateClients") === "on";
  const clientIds = formData.getAll("clientIds") as string[];

  await prisma.$transaction([
    prisma.user.update({ where: { id: adminId }, data: { canCreateClients } }),
    prisma.adminClientAccess.deleteMany({ where: { userId: adminId } }),
    prisma.adminClientAccess.createMany({
      data: clientIds.map((clientId) => ({ userId: adminId, clientId })),
      skipDuplicates: true,
    }),
  ]);

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { error: null };
}

// Aprueba una solicitud de cliente pendiente: crea el Client de verdad, se
// lo asigna a quien lo pidió, y marca la solicitud resuelta.
export async function approveClientRequest(formData: FormData) {
  const owner = await requireOwner();
  const id = formData.get("id") as string;
  if (!id) return;

  const request = await prisma.clientRequest.findUnique({
    where: { id },
    include: { requestedBy: { select: { email: true } } },
  });
  if (!request || request.status !== "pending") return;

  const baseSlug = slugify(request.name);
  let slug = baseSlug;
  let suffix = 1;
  while (RESERVED_SLUGS.includes(slug) || (await prisma.client.findUnique({ where: { slug } }))) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.$transaction([
    prisma.client.create({
      data: {
        name: request.name,
        slug,
        shareToken: generateShareToken(),
        adminAccess: { create: { userId: request.requestedById } },
      },
    }),
    prisma.clientRequest.update({
      where: { id },
      data: { status: "approved", resolvedById: owner.id, resolvedAt: new Date() },
    }),
  ]);

  notifyClientRequestResolved({
    requesterEmail: request.requestedBy.email,
    clientName: request.name,
    approved: true,
  }).catch(() => {});

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}

export async function denyClientRequest(formData: FormData) {
  const owner = await requireOwner();
  const id = formData.get("id") as string;
  if (!id) return;

  const request = await prisma.clientRequest.findUnique({
    where: { id },
    include: { requestedBy: { select: { email: true } } },
  });
  if (!request || request.status !== "pending") return;

  await prisma.clientRequest.update({
    where: { id },
    data: { status: "denied", resolvedById: owner.id, resolvedAt: new Date() },
  });

  notifyClientRequestResolved({
    requesterEmail: request.requestedBy.email,
    clientName: request.name,
    approved: false,
  }).catch(() => {});

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}
