import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Eraser, Dice5, Save, LayoutGrid, FolderOpen, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Genre } from "@/data/genres";

interface TransportProps {
  isPlaying: boolean;
  bpm: number;
  swing: number;
  step: number;
  onTogglePlay: () => void;
  onClear: () => void;
  onRandomize: () => void;
  onSave: () => void;
  onBpm: (v: number) => void;
  onSwing: (v: number) => void;
  activeGenre: Genre | null;
  // Genre Library
  genrePickerOpen: boolean;
  onToggleGenrePicker: () => void;
  genrePicker: React.ReactNode;
  // Saved Patterns
  savedPatternCount: number;
  savedPickerOpen: boolean;
  onToggleSavedPicker: () => void;
  savedPicker: React.ReactNode;
}

export function Transport({
  isPlaying,
  bpm,
  swing,
  step,
  onTogglePlay,
  onClear,
  onRandomize,
  onSave,
  onBpm,
  onSwing,
  activeGenre,
  genrePickerOpen,
  onToggleGenrePicker,
  genrePicker,
  savedPatternCount,
  savedPickerOpen,
  onToggleSavedPicker,
  savedPicker,
}: TransportProps) {
  return (
    <div className="panel flex flex-col gap-4 p-4">

      {/* Play controls + Genre Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">

        {/* Play / LED */}
        <div className="flex shrink-0 items-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={onTogglePlay}
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors",
              isPlaying
                ? "border-orange bg-orange text-graphite shadow-[0_0_24px_rgba(249,115,21,0.55)]"
                : "border-white/15 bg-white/[0.03] text-foreground hover:border-white/30",
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />}
          </motion.button>

          <div className="ml-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={cn(isPlaying ? "led animate-rm-pulse" : "led-off")} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {isPlaying ? "Running" : "Idle"}
              </span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-foreground/70">
              STEP {String(step >= 0 ? step + 1 : 1).padStart(2, "0")} / 16
            </span>
          </div>
        </div>

        {/* Genre info — shown when a genre is loaded */}
        <AnimatePresence mode="wait">
          {activeGenre && (
            <motion.div
              key={activeGenre.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="min-w-0 flex-1 border-l border-white/5 pl-4 sm:pl-6"
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Production Notes
              </p>
              <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[15px] font-bold tracking-tight">{activeGenre.name}</span>
                <span className="font-mono text-[11px] tabular-nums text-orange">{bpm} BPM</span>
                {activeGenre.swing > 0 && (
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    · swing {swing}%
                  </span>
                )}
              </div>
              <p className="text-[12px] italic text-muted-foreground">{activeGenre.description}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-foreground/75">
                {activeGenre.notes}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Genre Library + Saved Patterns toggle buttons */}
      <div className="flex gap-2">
        {/* Genre Library — ~62% width */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onToggleGenrePicker}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-semibold transition-colors",
            genrePickerOpen
              ? "border-orange/50 bg-orange/10 text-orange"
              : "border-orange/30 bg-orange/10 text-orange hover:bg-orange/15",
          )}
        >
          {genrePickerOpen ? <X className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          {genrePickerOpen ? "Close" : "Genre Library"}
        </motion.button>

        {/* Saved Patterns — ~38% width */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onToggleSavedPicker}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition-colors",
            savedPickerOpen
              ? "border-orange/50 bg-orange/10 text-orange"
              : "border-white/10 bg-white/[0.03] text-foreground/80 hover:border-white/20 hover:bg-white/[0.06]",
          )}
        >
          {savedPickerOpen ? <X className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
          <span className="truncate">
            {savedPickerOpen
              ? "Close"
              : <>My Patterns <span className="text-muted-foreground">· {savedPatternCount}</span></>
            }
          </span>
        </motion.button>
      </div>

      {/* Inline genre picker */}
      <AnimatePresence>
        {genrePickerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {genrePicker}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline saved patterns picker */}
      <AnimatePresence>
        {savedPickerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {savedPicker}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tempo */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tempo</span>
          <span className="font-mono text-sm font-bold tabular-nums text-orange text-glow-orange">
            {bpm} <span className="text-[10px] font-normal text-muted-foreground">BPM</span>
          </span>
        </div>
        <Slider min={60} max={200} step={1} value={[bpm]} onValueChange={(v: number[]) => onBpm(v[0] ?? bpm)} />
      </div>

      {/* Swing */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Swing</span>
          <span className="font-mono text-sm tabular-nums text-foreground/90">{swing}%</span>
        </div>
        <Slider min={0} max={60} step={1} value={[swing]} onValueChange={(v: number[]) => onSwing(v[0] ?? swing)} />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <ActionButton onClick={onRandomize} icon={<Dice5 className="h-4 w-4" />} label="Random" />
        <ActionButton onClick={onClear} icon={<Eraser className="h-4 w-4" />} label="Clear" />
        <ActionButton onClick={onSave} icon={<Save className="h-4 w-4" />} label="Save" />
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12px] font-semibold text-foreground/85 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      {icon}
      {label}
    </motion.button>
  );
}
