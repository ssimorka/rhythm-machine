import { motion } from "framer-motion";
import { Play, Pause, Square, Eraser, Dice5, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TransportProps {
  isPlaying: boolean;
  bpm: number;
  swing: number;
  step: number;
  onTogglePlay: () => void;
  onStop: () => void;
  onClear: () => void;
  onRandomize: () => void;
  onSave: () => void;
  onBpm: (v: number) => void;
  onSwing: (v: number) => void;
}

export function Transport({
  isPlaying,
  bpm,
  swing,
  step,
  onTogglePlay,
  onStop,
  onClear,
  onRandomize,
  onSave,
  onBpm,
  onSwing,
}: TransportProps) {
  return (
    <div className="panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6">
      {/* Big play button */}
      <div className="flex items-center gap-3">
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

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onStop}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Stop"
        >
          <Square className="h-4 w-4" fill="currentColor" />
        </motion.button>

        {/* LED + step counter */}
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

      <div className="hidden h-12 w-px bg-white/5 md:block" />

      {/* BPM + Swing: stacked below md, independent flex items on md+ */}
      <div className="flex flex-col gap-3 md:contents">
        {/* BPM */}
        <div className="flex min-w-0 flex-col gap-2 md:flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Tempo
            </span>
            <span className="font-mono text-sm font-bold tabular-nums text-orange text-glow-orange">
              {bpm} <span className="text-[10px] font-normal text-muted-foreground">BPM</span>
            </span>
          </div>
          <Slider min={60} max={200} step={1} value={[bpm]} onValueChange={(v: number[]) => onBpm(v[0] ?? bpm)} />
        </div>

        {/* Swing */}
        <div className="flex flex-col gap-2 md:w-44">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Swing</span>
            <span className="font-mono text-sm tabular-nums text-foreground/90">{swing}%</span>
          </div>
          <Slider min={0} max={60} step={1} value={[swing]} onValueChange={(v: number[]) => onSwing(v[0] ?? swing)} />
        </div>
      </div>

      <div className="hidden h-12 w-px bg-white/5 md:block" />

      {/* Action cluster */}
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
      <span className="hidden md:inline">{label}</span>
    </motion.button>
  );
}
