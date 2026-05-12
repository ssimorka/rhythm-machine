import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { matchGenre } from "@/lib/ai/matchGenre";
import type { Genre } from "@/data/genres";

interface AIPromptProps {
  onMatch: (g: Genre, reason: string) => void;
}

const SUGGESTIONS = [
  "Dark warehouse techno",
  "Dusty boom bap",
  "Aggressive trance anthem",
  "Late night deep house, 120 bpm",
];

export function AIPrompt({ onMatch }: AIPromptProps) {
  const [value, setValue] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const run = async (prompt: string) => {
    if (!prompt.trim()) return;
    setBusy(true);
    // Mock async — keeps the UX honest if we swap in a real LLM later.
    await new Promise<void>((resolve) => setTimeout(resolve, 380));
    const { genre, reason } = matchGenre(prompt);
    onMatch(genre, reason);
    setBusy(false);
  };

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-orange" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          AI Beat Generator
        </h3>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(value);
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe a vibe — 'dark warehouse techno'…"
          className="h-10 border-white/10 bg-graphite/60 text-[13px] placeholder:text-muted-foreground/70 focus-visible:ring-orange/40"
          disabled={busy}
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -1 }}
          disabled={busy || !value.trim()}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-orange/70 bg-orange px-3 text-[12px] font-bold text-graphite shadow-[0_8px_24px_-12px_rgba(249,115,21,0.7)] transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </motion.button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setValue(s);
              void run(s);
            }}
            className="chip transition-colors hover:border-orange/40 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
