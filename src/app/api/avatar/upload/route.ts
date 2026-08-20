import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Mismo patrón que api/documents/upload — autoriza uploads directos del
// navegador a Vercel Blob, acá restringido a imágenes (foto de perfil del
// cliente).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (session?.user?.role !== "admin") {
          throw new Error("Solo el admin puede cambiar fotos de perfil.");
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
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
