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
        if (session?.user?.role !== "admin") {
          throw new Error("Solo el admin puede subir documentos.");
        }
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "image/*",
            "application/zip",
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
