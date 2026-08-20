"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { STATUSES, STATUS_LABELS, STATUS_CLASS } from "@/lib/content";
import type { ContentStatus } from "@/generated/prisma/enums";

// Reemplaza un <select> nativo: los <option> de un select no se pueden
// colorear de forma confiable entre navegadores (terminaban con texto casi
// invisible sobre el fondo blanco que el navegador les pone), así que esto
// arma el propio menú desplegable con los mismos estilos de status-pill que
// el resto de la app.
export function StatusPicker({
  value,
  onChange,
}: {
  value: ContentStatus;
  onChange: (status: ContentStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.96 }}
        className={`status-pill cursor-pointer ${STATUS_CLASS[value]}`}
      >
        <span className="d" />
        {STATUS_LABELS[value]}
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-[calc(100%+6px)] left-0 z-40 min-w-[172px] rounded-[12px] border p-1.5"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface-3)",
              boxShadow: "0 20px 50px -14px oklch(0 0 0 / 0.55)",
            }}
          >
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[9px] px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className={`status-pill ${STATUS_CLASS[s]}`}>
                  <span className="d" />
                  {STATUS_LABELS[s]}
                </span>
                {s === value && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto h-3 w-3">
                    <path d="M4 12l6 6L20 6" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
