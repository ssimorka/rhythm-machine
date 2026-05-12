import { memo } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { StepButton } from "./StepButton";
import type { DrumId, TrackDef } from "@/data/tracks";
import type { TrackState } from "@/hooks/useSequencer";
import type { SampleStatus } from "@/lib/audio/engine";

interface TrackRowProps {
  track: TrackDef;
  steps: boolean[];
  state: TrackState;
  currentStep: number;
  sampleStatus?: SampleStatus;
  onToggleStep: (idx: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onVolume: (db: number) => void;
  onPreview: () => void;
  anySolo: boolean;
}

function statusDotClass(s: SampleStatus | undefined): string {
  switch (s) {
    case "ready":
      return "bg-emerald-400";
    case "loading":
      return "bg-amber-300 animate-pulse";
    case "error":
      return "bg-red-400";
    case "synth":
    default:
      return "bg-white/30";
  }
}

function TrackRowImpl({
  track,
  steps,
  state,
  currentStep,
  sampleStatus,
  onToggleStep,
  onToggleMute,
  onToggleSolo,
  onVolume,
  onPreview,
  anySolo,
}: TrackRowProps) {
  const dimmed = state.mute || (anySolo && !state.solo);
  return (
    <div
      className={cn(
        "grid grid-cols-[100px_1fr] items-center gap-2 px-2 py-1.5 transition-opacity sm:grid-cols-[160px_1fr] sm:gap-3 sm:px-3 sm:py-2 lg:grid-cols-[200px_1fr]",
        dimmed && "opacity-45",
      )}
    >
      {/* Label / controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="group flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1 text-left transition-colors hover:bg-white/[0.05] sm:gap-2 sm:px-2.5 sm:py-1.5"
          title={`Preview ${track.label}`}
        >
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass(sampleStatus))}
            title={
              sampleStatus === "ready"
                ? "Sample loaded"
                : sampleStatus === "loading"
                  ? "Loading sample…"
                  : sampleStatus === "error"
                    ? "Sample failed — using synth"
                    : "Synth voice"
            }
          />
          {/* Short name on mobile, full label on sm+ */}
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/90 sm:hidden">
            {track.short}
          </span>
          <span className="hidden truncate text-[13px] font-semibold tracking-wide text-foreground/90 sm:inline">
            {track.label}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMute}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border text-[10px] font-bold transition-colors",
              state.mute
                ? "border-red-400/60 bg-red-400/15 text-red-300"
                : "border-white/5 bg-white/[0.03] text-muted-foreground hover:text-foreground",
            )}
            title="Mute"
            aria-pressed={state.mute}
          >
            {state.mute ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSolo}
            className={cn(
              "h-7 w-7 rounded-md border text-[10px] font-bold transition-colors",
              state.solo
                ? "border-orange/70 bg-orange/15 text-orange"
                : "border-white/5 bg-white/[0.03] text-muted-foreground hover:text-foreground",
            )}
            title="Solo"
            aria-pressed={state.solo}
          >
            S
          </motion.button>
        </div>
      </div>

      {/* Steps + volume */}
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-16 gap-[3px] sm:gap-1.5">
          {steps.map((on, i) => (
            <StepButton
              key={i}
              active={on}
              current={currentStep === i}
              beat={i % 4 === 0}
              rowAccent={(Math.floor(i / 4) % 2) === 1}
              onToggle={() => onToggleStep(i)}
            />
          ))}
        </div>
        <div className="hidden w-24 shrink-0 md:block">
          <Slider
            min={-30}
            max={6}
            step={1}
            value={[state.volume]}
            onValueChange={(v: number[]) => onVolume(v[0] ?? 0)}
            aria-label={`${track.label} volume`}
          />
        </div>
      </div>
    </div>
  );
}

export const TrackRow = memo(TrackRowImpl);
