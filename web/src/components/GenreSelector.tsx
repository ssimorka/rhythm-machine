import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GENRES, type Genre } from "@/data/genres";

interface GenreSelectorProps {
  activeId: string | null;
  onPick: (g: Genre) => void;
}

export function GenreSelector({ activeId, onPick }: GenreSelectorProps) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Genre Library
        </h3>
        <span className="text-[10px] text-muted-foreground">{GENRES.length} presets</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {GENRES.map((g) => {
          const active = g.id === activeId;
          return (
            <motion.button
              key={g.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              onClick={() => onPick(g)}
              className={cn(
                "group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-orange/70 bg-orange/10"
                  : "border-white/5 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="genre-active-glow"
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-orange/40"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="flex w-full items-center justify-between">
                <span className={cn("text-[13px] font-semibold leading-tight", active && "text-orange")}>
                  {g.name}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {g.bpm}
                </span>
              </span>
              <span className="line-clamp-1 text-[11px] text-muted-foreground">{g.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
