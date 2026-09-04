import "server-only";
import { randomBytes } from "crypto";

// Token de link público de solo lectura (Client.shareToken, ver
// prisma/schema.prisma). 24 bytes al azar en base64url (~192 bits de
// entropía, 32 caracteres) — imposible de adivinar, y URL-safe sin
// necesidad de codificar nada más al armar el link.
export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}
