import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PATCH_NOTES = [
  {
    version: "v1.1",
    latest: true,
    items: [
      "Saved patterns now live in their own panel next to Genre Library",
      "Current settings (genre, swing, tempo, etc) persist across page refreshes",
      "Fixed sound not playing through iPhone speaker",
      "Fixed audio playing in background when switching tabs",
    ],
  },
  {
    version: "v1.0",
    latest: false,
    items: [
      "Initial release — 13 genre presets, swing control, per-track volume and mute, quantized pattern loading",
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PatchNotesModal({ open, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            // Prevent backdrop click propagating through the panel
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel w-full max-w-sm p-5">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Patch Notes
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Versions */}
              <div className="flex flex-col gap-5">
                {PATCH_NOTES.map((section) => (
                  <div key={section.version}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className={`font-mono text-[13px] font-bold ${section.latest ? "text-orange" : "text-foreground/50"}`}>
                        {section.version}
                      </span>
                      {section.latest && (
                        <span className="rounded-full border border-orange/30 bg-orange/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-orange">
                          Latest
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[12px] leading-relaxed text-foreground/70">
                          <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-white/25" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
