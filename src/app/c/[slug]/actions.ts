"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { notifyAdminsOfClientActivity } from "@/lib/email";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export type CommentFormState = { error: string | null };

// Todas estas acciones re-verifican que la pieza pertenezca al cliente de la
// sesión — el middleware ya restringe la ruta /c/[slug] al slug propio, pero
// una server action se puede invocar directo, así que no confiamos solo en
// eso (ver ARCHITECTURE.md, "Roles y acceso").
async function assertOwnsPiece(pieceId: string, clientId: string) {
  const piece = await prisma.contentPiece.findUnique({
    where: { id: pieceId },
    include: { client: { select: { name: true, slug: true } } },
  });
  if (!piece || piece.clientId !== clientId) throw new Error("No autorizado.");
  return piece;
}

export async function addComment(
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client" || !session.user.clientId) {
    return { error: "Sesión inválida." };
  }

  const pieceId = formData.get("pieceId") as string;
  const slug = formData.get("slug") as string;
  const body = (formData.get("body") as string | null)?.trim();
  if (!body) return { error: "Escribí algo antes de comentar." };

  const piece = await assertOwnsPiece(pieceId, session.user.clientId);

  await prisma.comment.create({
    data: { contentPieceId: pieceId, authorId: session.user.id, body },
  });

  notifyAdminsOfClientActivity({
    clientName: piece.client.name,
    clientSlug: piece.client.slug,
    pieceTitle: piece.title,
    pieceId,
    action: "comment",
    commentBody: body,
  }).catch(() => {});

  revalidatePath(`/c/${slug}`);
  return { error: null };
}

// El cliente solo puede mover a estos dos estados — no puede publicar,
// programar ni volver a borrador (eso lo maneja el CM desde /admin).
export async function clientApprove(pieceId: string, slug: string) {
  await clientSetStatus(pieceId, slug, "approved");
}

export async function clientRequestChanges(pieceId: string, slug: string) {
  await clientSetStatus(pieceId, slug, "changes_requested");
}

async function clientSetStatus(pieceId: string, slug: string, status: "approved" | "changes_requested") {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client" || !session.user.clientId) return;

  const piece = await assertOwnsPiece(pieceId, session.user.clientId);

  await prisma.$transaction([
    prisma.contentPiece.update({ where: { id: pieceId }, data: { status } }),
    prisma.approvalEvent.create({
      data: { contentPieceId: pieceId, status, changedById: session.user.id },
    }),
  ]);

  notifyAdminsOfClientActivity({
    clientName: piece.client.name,
    clientSlug: piece.client.slug,
    pieceTitle: piece.title,
    pieceId,
    action: status,
  }).catch(() => {});

  revalidatePath(`/c/${slug}`);
}
