"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { isVideoUrl } from "@/lib/media";
import { VideoThumbnail } from "@/components/VideoThumbnail";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_BYTES = 64 * 1024 * 1024; // 64MB
const ALLOWED_TYPES: Record<string, number> = {
  "image/png": MAX_IMAGE_BYTES,
  "image/jpeg": MAX_IMAGE_BYTES,
  "video/mp4": MAX_VIDEO_BYTES,
};

const inputCls = "rounded-[11px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]";

// Media de una pieza: URL externa (como antes) o archivo local subido a
// Vercel Blob (mismo patrón que ClientAvatarUpload/DocumentsSection) — solo
// png/jpg/mp4, con límite de tamaño distinto por tipo (2MB imagen, 64MB
// video, a pedido de Bautista).
export function MediaField({ defaultValue }: { defaultValue: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    const maxBytes = ALLOWED_TYPES[file.type];
    if (!maxBytes) {
      setError("Solo se aceptan archivos .png, .jpg o .mp4.");
      return;
    }
    if (file.size > maxBytes) {
      setError(`El archivo supera el máximo permitido (${maxBytes === MAX_IMAGE_BYTES ? "2MB para imágenes" : "64MB para video"}).`);
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/media/upload" });
      setValue(blob.url);
    } catch {
      setError("Falló la subida, probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
        Imagen/video <span className="font-normal normal-case" style={{ color: "var(--text-faint)" }}>(opcional — URL o subir archivo)</span>
      </label>

      <div className="flex gap-2">
        <input
          name="mediaUrl"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://..."
          className={`flex-1 ${inputCls}`}
          style={{ borderColor: "var(--border)" }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-[11px] border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
        >
          {uploading ? "Subiendo..." : "Subir archivo"}
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,video/mp4" onChange={handleFile} className="hidden" />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {value && !uploading && (
        <div className="mt-1 flex items-center gap-2">
          {isVideoUrl(value) ? (
            <VideoThumbnail src={value} className="h-16 w-16 rounded-[9px] object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-16 w-16 rounded-[9px] object-cover" />
          )}
          <button
            type="button"
            onClick={() => setValue("")}
            className="text-xs font-semibold"
            style={{ color: "var(--text-faint)" }}
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}
