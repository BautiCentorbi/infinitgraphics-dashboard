"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { createDocumentRecord, deleteDocument } from "./actions";

export type DocumentItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  createdAt: string; // ISO
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function DocumentsSection({
  clientId,
  slug,
  documents,
}: {
  clientId: string;
  slug: string;
  documents: DocumentItem[];
}) {
  const [items, setItems] = useState(documents);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get("title") as string)?.trim();
    const description = (fd.get("description") as string) ?? "";
    const file = fd.get("file") as File | null;

    if (!title) return setError("El título es obligatorio.");
    if (!file || file.size === 0) return setError("Elegí un archivo.");

    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/documents/upload",
      });

      const id = await createDocumentRecord({
        clientId,
        slug,
        title,
        description,
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || null,
      });
      if (!id) throw new Error("no id");

      setItems((prev) => [
        {
          id,
          title,
          description: description || null,
          fileUrl: blob.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      formRef.current?.reset();
    } catch (err) {
      console.error("Error subiendo documento:", err);
      const message = err instanceof Error ? err.message : "error desconocido";
      setError(`No se pudo subir el archivo (${message}).`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          Documentación
        </h2>
        <button onClick={() => setOpen(!open)} className="text-xs font-semibold" style={{ color: "var(--sky)" }}>
          {open ? "Cancelar" : "+ Subir"}
        </button>
      </div>

      {open && (
        <form ref={formRef} onSubmit={handleSubmit} className="surface mb-3 flex min-w-0 flex-col gap-2.5 rounded-[14px] p-3.5">
          <input
            name="title"
            placeholder="Título (ej. Manual de marca)"
            required
            className="w-full min-w-0 rounded-[10px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]"
            style={{ borderColor: "var(--border)" }}
          />
          <input
            name="description"
            placeholder="Descripción (opcional)"
            className="w-full min-w-0 rounded-[10px] border bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--sky)]"
            style={{ borderColor: "var(--border)" }}
          />
          <input
            name="file"
            type="file"
            required
            className="w-full min-w-0 max-w-full text-xs file:mr-3 file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--text)]"
            style={{ color: "var(--text-dim)" }}
          />
          <button type="submit" disabled={uploading} className="btn-grad self-start">
            {uploading ? "Subiendo..." : "Subir documento"}
          </button>
          {error && <p className="text-sm text-red-400 break-words">{error}</p>}
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Sin documentos todavía — subí manuales, guías de marca o lo que necesites.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((doc) => (
            <li key={doc.id} className="surface surface-hover group flex items-start gap-3 rounded-[13px] p-3 transition-colors">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px]"
                style={{ background: "var(--surface-2)", color: "var(--sky)" }}
              >
                <FileIcon />
              </div>
              <div className="min-w-0 flex-1">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-semibold hover:underline">
                  {doc.title}
                </a>
                {doc.description && (
                  <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-dim)" }}>
                    {doc.description}
                  </p>
                )}
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
                  {formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString("es-AR")}
                </p>
              </div>
              <form
                action={async (fd) => {
                  await deleteDocument(fd);
                  setItems((prev) => prev.filter((d) => d.id !== doc.id));
                }}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <input type="hidden" name="id" value={doc.id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="text-xs" style={{ color: "var(--text-faint)" }}>
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
