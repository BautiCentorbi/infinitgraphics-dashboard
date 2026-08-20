"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PRIORITIES, PRIORITY_LABELS, PRIORITY_COLOR } from "@/lib/content";
import type { TaskPriority } from "@/generated/prisma/enums";

export function PriorityPicker({ value, onChange }: { value: TaskPriority; onChange: (p: TaskPriority) => void }) {
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
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors"
        style={{ background: "var(--surface-2)", color: PRIORITY_COLOR[value] }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[value] }} />
        {PRIORITY_LABELS[value]}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-[calc(100%+4px)] left-0 z-30 min-w-[120px] rounded-[10px] border p-1"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface-3)", boxShadow: "0 16px 40px -12px oklch(0 0 0 / 0.55)" }}
          >
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(p);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-[var(--surface-2)]"
                style={{ color: PRIORITY_COLOR[p] }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
