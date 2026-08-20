import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminsSection } from "./AdminsSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-10 py-16">
      <h1 className="mb-1.5 text-center text-2xl font-bold tracking-tight font-display">Configuración</h1>
      <p className="mb-8 text-center text-sm" style={{ color: "var(--text-dim)" }}>
        Administración de la cuenta y del equipo.
      </p>

      <AdminsSection
        admins={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
        currentUserId={session?.user?.id ?? ""}
      />
    </div>
  );
}
