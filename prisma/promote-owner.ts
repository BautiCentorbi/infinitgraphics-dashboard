// Script de un solo uso: promueve al admin original (ADMIN_EMAIL, el
// seedeado en prisma/seed.ts) a role="owner" tras la migración que separó
// owner/admin (2026-09-04, ver CLAUDE.md). Correr una vez con:
//   npx tsx prisma/promote-owner.ts
// No se borra del repo por si hace falta repetir el proceso en otro entorno
// (ej. recrear la base desde cero en otra PC).
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) throw new Error("Falta ADMIN_EMAIL en el .env");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No existe ningún usuario con email ${email}`);
  if (user.role === "owner") {
    console.log(`${email} ya es owner, no hay nada que hacer.`);
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: "owner" } });
  console.log(`${email} promovido a owner.`);
}

main();
