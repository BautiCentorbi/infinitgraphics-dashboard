// Script de un solo uso: al introducir AdminClientAccess (2026-09-04), los
// admins ya existentes (invitados antes de este cambio, cuando "admin"
// significaba acceso total) quedaron sin ningún cliente asignado — la
// tabla nueva arranca vacía. Esto les da acceso a TODOS los clientes que
// existen hoy, para no cambiarles la experiencia de un día para el otro.
// Correr una sola vez con: npx tsx prisma/backfill-admin-access.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true, email: true } });
  const clients = await prisma.client.findMany({ select: { id: true } });

  if (admins.length === 0 || clients.length === 0) {
    console.log("Nada que hacer.");
    return;
  }

  const rows = admins.flatMap((a) => clients.map((c) => ({ userId: a.id, clientId: c.id })));
  const result = await prisma.adminClientAccess.createMany({ data: rows, skipDuplicates: true });

  console.log(`Acceso otorgado: ${result.count} filas.`);
  for (const a of admins) console.log(`- ${a.email}: acceso a los ${clients.length} clientes existentes.`);
}
main();
