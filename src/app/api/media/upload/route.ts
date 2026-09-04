import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Autoriza uploads directos del navegador a Vercel Blob para el media
// (imagen/video) de una pieza de calendario — mismo patrón que
// /api/documents/upload y /api/avatar/upload: el archivo nunca pasa por
// esta función, solo se emite el token firmado.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (session?.user?.role !== "admin" && session?.user?.role !== "owner") {
          throw new Error("Solo el admin puede subir media.");
        }
        return {
          // A pedido de Bautista: solo estos 3 formatos, nada más.
          allowedContentTypes: ["image/png", "image/jpeg", "video/mp4"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
