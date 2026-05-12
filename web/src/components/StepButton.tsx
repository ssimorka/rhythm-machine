import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepButtonProps {
  active: boolean;
  current: boolean;
  beat: boolean; // first step of a 4-step group
  onToggle: () => void;
  rowAccent?: boolean;
}

function StepButtonImpl({ active, current, beat, onToggle, rowAccent = false }: StepButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "relative h-8 w-full select-none rounded-md border outline-none transition-colors sm:h-10",
        "focus-visible:ring-2 focus-visible:ring-orange/60",
        // base
        active
          ? "border-orange/70 bg-orange text-graphite"
          : cn(
              "border-white/5 bg-white/[0.025] hover:bg-white/[0.05]",
              beat && "bg-white/[0.05]",
              rowAccent && !active && "bg-white/[0.04]",
            ),
      )}
      aria-pressed={active}
    >
      {/* inner sheen */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-md",
          active
            ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_0_18px_rgba(249,115,21,0.55)]"
            : "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.35)]",
        )}
      />

      {/* glow on active */}
      {active && (
        <motion.span
          aria-hidden
          layoutId={undefined}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -inset-1 rounded-lg bg-orange/25 blur-md"
        />
      )}

      {/* playhead indicator */}
      {current && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "pointer-events-none absolute inset-0 rounded-md ring-2",
            active ? "ring-white/90" : "ring-orange/80",
          )}
        />
      )}
    </motion.button>
  );
}

export const StepButton = memo(StepButtonImpl);
