import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import type { Genre } from "@/data/genres";

interface GenreInfoProps {
  genre: Genre | null;
  reason?: string;
}

export function GenreInfo({ genre, reason }: GenreInfoProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={genre?.id ?? "empty"}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        className="panel p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Production Notes
          </h3>
        </div>
        {genre ? (
          <>
            <div className="mb-1 flex items-baseline gap-2">
              <h4 className="text-[15px] font-bold tracking-tight">{genre.name}</h4>
              <span className="font-mono text-[11px] tabular-nums text-orange">
                {genre.bpm} BPM
              </span>
              {genre.swing > 0 && (
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  · swing {genre.swing}%
                </span>
              )}
            </div>
            <p className="mb-2 text-[12px] italic text-muted-foreground">{genre.description}</p>
            <p className="text-[12px] leading-relaxed text-foreground/85">{genre.notes}</p>
            {reason && (
              <p className="mt-3 rounded-md border border-orange/20 bg-orange/5 px-2.5 py-1.5 text-[11px] text-orange/90">
                <span className="font-mono uppercase tracking-widest text-orange/70">AI · </span>
                {reason}
              </p>
            )}
          </>
        ) : (
          <p className="text-[12px] text-muted-foreground">Pick a genre to load a pattern.</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
