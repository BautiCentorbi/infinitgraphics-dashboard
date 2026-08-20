"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { updateClientAvatar, removeClientAvatar } from "@/app/admin/actions";
import { AVATAR_GRADIENTS, initials } from "@/lib/avatar";

export function ClientAvatarUpload({
  clientId,
  name,
  avatarUrl,
  colorIndex,
}: {
  clientId: string;
  name: string;
  avatarUrl: string | null;
  colorIndex: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/avatar/upload" });
      await updateClientAvatar(clientId, blob.url);
      setPreview(blob.url);
      router.refresh();
    } catch {
      // silencioso a propósito: si falla, el avatar simplemente no cambia
      // y el usuario puede reintentar — no vale la pena un modal de error
      // para esto.
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      await removeClientAvatar(clientId);
      setPreview(null);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="group relative h-14 w-14 shrink-0">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[16px] font-display text-xl font-bold text-white"
        style={{ background: preview ? undefined : AVATAR_GRADIENTS[colorIndex % AVATAR_GRADIENTS.length] }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
        <span
          className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
        >
          {uploading ? "..." : "Cambiar"}
        </span>
      </button>
      {preview && !uploading && (
        <button
          onClick={handleRemove}
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)" }}
          title="Quitar foto"
        >
          ✕
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
