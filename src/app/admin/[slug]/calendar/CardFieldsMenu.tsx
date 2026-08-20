"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_FIELDS, CARD_FIELD_LABELS, type CardField } from "@/lib/content";

// Qué propiedades se muestran en las tarjetas de Calendario/Kanban — es una
// preferencia de visualización personal, no un dato del cliente, así que
// vive en localStorage (por cliente, por navegador) en vez de la base.
export function useCardFields(slug: string) {
  const storageKey = `cm-suite:card-fields:${slug}`;
  const [fields, setFields] = useState<CardField[]>(CARD_FIELDS as unknown as CardField[]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setFields(JSON.parse(saved));
    } catch {
      // localStorage corrupto/deshabilitado — seguimos con el default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function toggle(field: CardField) {
    setFields((prev) => {
      const next = prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  return { fields, toggle };
}

export function CardFieldsMenu({
  fields,
  onToggle,
}: {
  fields: CardField[];
  onToggle: (field: CardField) => void;
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="surface surface-hover flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12.5px] font-semibold transition-colors"
        style={{ color: "var(--text-dim)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="14" y2="18" />
          <circle cx="18" cy="18" r="2" />
        </svg>
        Tarjetas
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 z-20 w-56 rounded-[14px] border p-2"
          style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)", boxShadow: "0 20px 50px -14px oklch(0 0 0 / 0.55)" }}
        >
          <p className="px-2 pt-1 pb-2 text-[10.5px] font-bold tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
            Mostrar en las tarjetas
          </p>
          {CARD_FIELDS.map((f) => (
            <label
              key={f}
              className="flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-sm transition-colors hover:bg-[var(--surface-3)]"
            >
              <input
                type="checkbox"
                checked={fields.includes(f)}
                onChange={() => onToggle(f)}
                className="h-3.5 w-3.5 accent-[var(--sky)]"
              />
              {CARD_FIELD_LABELS[f]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
