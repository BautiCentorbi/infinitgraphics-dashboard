"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { isVideoUrl } from "@/lib/media";

// Lightbox genérico para ver un adjunto (imagen o video) en grande — se
// abre al hacer click sobre una miniatura (PiecePreview del hover admin,
// PieceDetail del cliente). Cierra con el botón ✕, con click en el fondo
// (afuera del media), o con Escape. z-50: por encima de cualquier popover/
// modal existente (PiecePreview es z-30, PieceModal/PieceDetail son z-20).
export function MediaLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "oklch(0 0 0 / 0.78)", backdropFilter: "blur(3px)" }}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-[10px] text-sm"
        style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border-strong)" }}
      >
        ✕
      </button>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[85vw]"
      >
        {isVideoUrl(src) ? (
          // Sin autoPlay: un video con audio que arranca solo, el navegador
          // lo bloquea directamente (autoplay sin muted no está permitido) y
          // queda "trabado" con apariencia de que no reproduce — mejor dejar
          // que el usuario le dé play desde los controles nativos.
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={src} controls playsInline preload="metadata" className="max-h-[85vh] max-w-[85vw] rounded-[14px]" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="max-h-[85vh] max-w-[85vw] rounded-[14px] object-contain" />
        )}
      </motion.div>
    </motion.div>
  );
}
