import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FolderOpen } from "lucide-react";
import { loadPatterns, removePattern, type SavedPattern } from "@/utils/storage";

interface SavedPatternsProps {
  refreshKey: number;
  onLoad: (p: SavedPattern) => void;
}

export function SavedPatterns({ refreshKey, onLoad }: SavedPatternsProps) {
  const [list, setList] = useState<SavedPattern[]>([]);

  useEffect(() => {
    setList(loadPatterns());
  }, [refreshKey]);

  const handleRemove = useCallback((id: string) => {
    removePattern(id);
    setList(loadPatterns());
  }, []);

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Saved Patterns
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground">{list.length}</span>
      </div>
      {list.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          No saved patterns yet. Hit{" "}
          <span className="font-mono text-foreground/80">Save</span> to keep a groove for later.
        </p>
      ) : (
        <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {list.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => onLoad(p)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="truncate text-[13px] font-semibold">{p.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {p.bpm} BPM
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(p.id)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
