import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Crea (o actualiza la contraseña de) el owner único, a partir de
// ADMIN_EMAIL / ADMIN_PASSWORD en el entorno — el owner ve/gestiona todo,
// incluyendo invitar administradores acotados (ver CLAUDE.md,
// "Administradores acotados", 2026-09-04; prisma/promote-owner.ts si hace
// falta promover un usuario ya existente en vez de correr este seed).
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Definí ADMIN_EMAIL y ADMIN_PASSWORD en .env antes de correr el seed."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const owner = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "owner" },
    create: { email, passwordHash, role: "owner" },
  });

  console.log(`Owner listo: ${owner.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
