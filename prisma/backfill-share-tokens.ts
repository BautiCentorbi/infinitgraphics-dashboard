// Script de un solo uso: genera Client.shareToken para los clientes que ya
// existían antes de agregar el link público de solo lectura (2026-09-04).
// A partir de ahora, createClient/approveClientRequest generan el token al
// crear el cliente — esto es solo para los que ya estaban.
// Correr una sola vez con: npx tsx prisma/backfill-share-tokens.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "crypto";

function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const clients = await prisma.client.findMany({ where: { shareToken: null }, select: { id: true, name: true } });
  if (clients.length === 0) {
    console.log("Nada que hacer.");
    return;
  }

  for (const c of clients) {
    await prisma.client.update({ where: { id: c.id }, data: { shareToken: generateShareToken() } });
    console.log(`${c.name}: token generado.`);
  }
}
main();
