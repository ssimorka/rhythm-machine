import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { SavedPattern } from "@/utils/storage";

interface SavedPatternsProps {
  patterns: SavedPattern[];
  onLoad: (p: SavedPattern) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function SavedPatterns({ patterns, onLoad, onDelete, onRename }: SavedPatternsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit(p: SavedPattern, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(p.id);
    setEditName(p.name);
    // focus happens via autoFocus on the input
  }

  function commitEdit(id: string) {
    const trimmed = editName.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
  }

  if (patterns.length === 0) {
    return (
      <p className="py-1 text-[12px] text-muted-foreground">
        No saved patterns yet. Hit{" "}
        <span className="font-mono text-foreground/80">Save</span> to keep a groove for later.
      </p>
    );
  }

  return (
    <ul className="flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-0.5 scrollbar-thin">
      <AnimatePresence initial={false}>
        {patterns.map((p) => {
          const isEditing = editingId === p.id;
          return (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 12 }}
              onClick={() => !isEditing && onLoad(p)}
              className="group flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              {/* Name + BPM */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => commitEdit(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); commitEdit(p.id); }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-[13px] font-semibold text-foreground outline-none border-b border-orange/50 focus:border-orange pb-px"
                  />
                ) : (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => startEdit(p, e)}
                    onKeyDown={(e) => e.key === "Enter" && startEdit(p, e as unknown as React.MouseEvent)}
                    title="Click to rename"
                    className="truncate text-[13px] font-semibold text-foreground/90 transition-colors hover:text-orange cursor-text"
                  >
                    {p.name}
                  </span>
                )}
                <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {p.bpm} BPM
                </span>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-red-400"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
