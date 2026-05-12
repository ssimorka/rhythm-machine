import { useCallback, useMemo, useState } from "react";
import simorkaLogo from "@/assets/simorka-logo.png";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Disc3 } from "lucide-react";
import { useSequencer } from "@/hooks/useSequencer";
import { TRACKS } from "@/data/tracks";
import { Transport } from "@/components/Transport";
import { TrackRow } from "@/components/TrackRow";
import { GenreSelector } from "@/components/GenreSelector";
import { SavedPatterns } from "@/components/SavedPatterns";
import { GENRES, getGenre, type Genre } from "@/data/genres";
import { addPattern, type SavedPattern } from "@/utils/storage";

const Index = () => {
  const seq = useSequencer();
  const [savedKey, setSavedKey] = useState<number>(0);
  const [genrePickerOpen, setGenrePickerOpen] = useState(false);

  const activeGenre: Genre | null = useMemo(() => {
    return seq.state.activeGenreId ? (getGenre(seq.state.activeGenreId) ?? null) : null;
  }, [seq.state.activeGenreId]);

  const anySolo = useMemo(
    () => Object.values(seq.state.tracks).some((t) => t.solo),
    [seq.state.tracks],
  );

  const handlePickGenre = useCallback(
    (g: Genre) => {
      seq.loadGenre(g);
      setGenrePickerOpen(false);
      toast.success(`Loaded ${g.name}`, { description: `${g.bpm} BPM · swing ${g.swing}%` });
    },
    [seq],
  );

  const handleSave = useCallback(() => {
    const name = activeGenre ? `${activeGenre.name} edit` : `Pattern ${new Date().toLocaleTimeString()}`;
    const volumes: Record<string, number> = {};
    const mutes: Record<string, boolean> = {};
    for (const [id, state] of Object.entries(seq.state.tracks)) {
      volumes[id] = state.volume;
      mutes[id] = state.mute;
    }
    addPattern({
      name,
      bpm: seq.state.bpm,
      swing: seq.state.swing,
      pattern: seq.state.pattern,
      volumes,
      mutes,
    });
    setSavedKey((k) => k + 1);
    toast.success("Pattern saved", { description: "Stored in this browser." });
  }, [activeGenre, seq.state.bpm, seq.state.swing, seq.state.pattern, seq.state.tracks]);

  const handleLoadSaved = useCallback(
    (p: SavedPattern) => {
      seq.scheduleLoad({
        pattern: p.pattern,
        bpm: p.bpm,
        swing: p.swing,
        volumes: p.volumes,
        mutes: p.mutes,
      });
      if (seq.state.isPlaying) {
        toast.info(`Queued: ${p.name}`, { description: "Loads at the next bar." });
      } else {
        toast.success(`Loaded ${p.name}`);
      }
    },
    [seq],
  );

  const handleRandomize = useCallback(() => {
    seq.randomize();
    toast.info("Pattern randomized", { description: "Tap steps to refine the groove." });
  }, [seq]);

  const handleClear = useCallback(() => {
    seq.clearPattern();
    toast.message("Pattern cleared");
  }, [seq]);

  return (
    <div className="min-h-screen w-full pb-16 sm:pb-20">
      {/* Header */}
      <header className="container flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-8">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-orange/40 bg-orange/15"
          >
            <Disc3 className="h-6 w-6 text-orange" />
            <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-orange/30 ring-offset-2 ring-offset-graphite" />
          </motion.div>
          <div>
            <h1 className="text-xl font-extrabold leading-none tracking-tight sm:text-2xl">
              Rhythm <span className="text-orange">Machine</span>
            </h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              16-step boutique groovebox · v1.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="chip">
            <span className={seq.state.isPlaying ? "led" : "led-off"} />
            {seq.state.isPlaying ? "Live" : "Idle"}
          </span>
        </div>
      </header>

      {/* Main column */}
      <main className="container mt-3 flex flex-col gap-3 sm:mt-5 sm:gap-4">
        <Transport
          isPlaying={seq.state.isPlaying}
          bpm={seq.state.bpm}
          swing={seq.state.swing}
          step={seq.state.step}
          onTogglePlay={seq.togglePlay}
          onClear={handleClear}
          onRandomize={handleRandomize}
          onSave={handleSave}
          onBpm={seq.setBpm}
          onSwing={seq.setSwing}
          activeGenre={activeGenre}
          genrePickerOpen={genrePickerOpen}
          onToggleGenrePicker={() => setGenrePickerOpen((v) => !v)}
          genrePicker={
            <GenreSelector activeId={seq.state.activeGenreId} onPick={handlePickGenre} embedded />
          }
        />

        {/* Sequencer grid */}
        <div className="panel overflow-hidden">
          {/* Horizontal scroll on sm+ only; mobile uses stacked track layout */}
          <div className="sm:overflow-x-auto sm:scrollbar-thin">
            <div className="sm:min-w-[520px]">
              {/* Step ruler — only visible sm+ */}
              <div className="hidden grid-cols-[240px_1fr] items-center gap-3 border-b border-white/5 bg-black/20 px-3 py-2 sm:grid lg:grid-cols-[260px_1fr]">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Tracks · {TRACKS.length}
                </span>
                <div className="grid grid-cols-16 gap-[3px] sm:gap-1.5">
                  {Array.from({ length: 16 }, (_, i) => (
                    <div
                      key={i}
                      className={`flex h-5 items-center justify-center font-mono text-[10px] tabular-nums ${
                        seq.state.step === i ? "text-orange text-glow-orange" : "text-muted-foreground/60"
                      } ${i % 4 === 0 ? "font-bold" : ""}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {TRACKS.map((t) => (
                  <TrackRow
                    key={t.id}
                    track={t}
                    steps={seq.state.pattern[t.id]}
                    state={seq.state.tracks[t.id]}
                    currentStep={seq.state.step}
                    sampleStatus={seq.state.sampleStatus[t.id]}
                    anySolo={anySolo}
                    onToggleStep={(idx) => seq.toggleStep(t.id, idx)}
                    onToggleMute={() => seq.toggleMute(t.id)}
                    onToggleSolo={() => seq.toggleSolo(t.id)}
                    onVolume={(v) => seq.setTrackVolume(t.id, v)}
                    onPreview={() => seq.previewTrack(t.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Tip · Click a track label to preview · S = solo · speaker icon = mute
        </p>

        <SavedPatterns refreshKey={savedKey} onLoad={handleLoadSaved} />
      </main>

      {/* Footer */}
      <footer className="container mt-10 flex items-center justify-between border-t border-white/5 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        <span>{GENRES.length} genres · {TRACKS.length} tracks · 16 steps</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/50">Built by</span>
          <img
            src={simorkaLogo}
            alt="Simorka Designs"
            className="h-4 w-auto opacity-60 transition-opacity hover:opacity-100"
            title="Simorka Designs"
          />
        </div>
      </footer>
    </div>
  );
};

export default Index;
