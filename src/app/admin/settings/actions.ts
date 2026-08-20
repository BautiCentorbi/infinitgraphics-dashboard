"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewAdmin } from "@/lib/email";

export type AdminFormState = { error: string | null };

// Invita un administrador nuevo — mismo acceso que cualquier otro admin
// (ve todos los clientes, sin permisos más finos por ahora, ver
// ARCHITECTURE.md "Roles y acceso"). Pensado para compañeros de trabajo u
// otras personas de confianza que necesiten controlar/dar feedback.
export async function createAdmin(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!email) return { error: "El email es obligatorio." };
  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe un usuario con ese email." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash, role: "admin" } });

  const session = await auth();
  if (session?.user?.email) {
    notifyNewAdmin({ email, invitedByEmail: session.user.email }).catch(() => {});
  }

  revalidatePath("/admin/settings");
  return { error: null };
}

export async function deleteAdmin(formData: FormData): Promise<AdminFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: null };

  const session = await auth();
  if (id === session?.user?.id) {
    return { error: "No podés borrar tu propio acceso desde acá." };
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount <= 1) {
    return { error: "Tiene que quedar al menos un administrador." };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/settings");
  return { error: null };
}
