import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Autoriza uploads directos del navegador a Vercel Blob (el archivo nunca
// pasa por esta función — solo emite el token firmado). Necesario para no
// pegar contra el límite de tamaño de las server actions/route handlers de
// Vercel (~4.5MB), ya que un manual en PDF puede superarlo fácil.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (session?.user?.role !== "admin" && session?.user?.role !== "owner") {
          throw new Error("Solo el admin puede subir documentos.");
        }
        return {
          // A pedido de Bautista (2026-08-21): solo estos 4 formatos, nada
          // más — antes aceptaba de todo (doc/xls viejos, txt, imágenes,
          // zip). Tamaño máximo (2MB) se valida del lado del cliente en
          // DocumentsSection.tsx, antes de llamar upload() — Blob no recibe
          // el archivo acá, solo emite el token, así que no hay forma de
          // validar tamaño en este endpoint.
          allowedContentTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          ],
          addRandomSuffix: true,
        };
      },
      // El callback de finalización de Vercel (webhook) no llega en
      // localhost — el registro en la base se crea desde una server action
      // aparte que el cliente llama apenas termina el upload (funciona
      // igual en local y en producción).
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
