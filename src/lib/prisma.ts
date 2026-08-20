import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requiere un driver adapter explícito (ya no arma la conexión
// mágicamente a partir de DATABASE_URL en el datasource del schema).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Evita crear múltiples instancias de PrismaClient en dev (hot reload de
// Next.js recarga este módulo en cada cambio).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
