import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { TRACKS, type DrumId, type Pattern, STEPS, emptyPattern } from "@/data/tracks";
import { getEngine, type SampleStatus } from "@/lib/audio/engine";
import { GENRES, type Genre } from "@/data/genres";

export interface TrackState {
  volume: number; // dB
  mute: boolean;
  solo: boolean;
}

/** Data bundle used for immediate or quantized pattern loads */
export interface PendingLoad {
  pattern: Pattern;
  bpm: number;
  swing: number;
  volumes?: Partial<Record<string, number>>;
  mutes?: Partial<Record<string, boolean>>;
}

export interface SequencerState {
  isPlaying: boolean;
  step: number; // current playback step, -1 when stopped
  bpm: number;
  swing: number; // 0..100
  pattern: Pattern;
  tracks: Record<DrumId, TrackState>;
  sampleStatus: Partial<Record<DrumId, SampleStatus>>;
  activeGenreId: string | null;
  hasPendingLoad: boolean;
}

const DEFAULT_BPM = 124;
const DEFAULT_SWING = 14;

function defaultTracks(): Record<DrumId, TrackState> {
  const t = {} as Record<DrumId, TrackState>;
  for (const tr of TRACKS) t[tr.id] = { volume: 0, mute: false, solo: false };
  return t;
}

export function useSequencer() {
  const [pattern, setPattern] = useState<Pattern>(() => GENRES[0].pattern);
  const [bpm, setBpm] = useState<number>(GENRES[0].bpm);
  const [swing, setSwing] = useState<number>(GENRES[0].swing);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [step, setStep] = useState<number>(-1);
  const [tracks, setTracks] = useState<Record<DrumId, TrackState>>(() => defaultTracks());
  const [sampleStatus, setSampleStatus] = useState<Partial<Record<DrumId, SampleStatus>>>({});
  const [activeGenreId, setActiveGenreId] = useState<string | null>(GENRES[0].id);
  const [hasPendingLoad, setHasPendingLoad] = useState(false);

  // Refs to avoid stale closures inside Tone callbacks
  const patternRef = useRef<Pattern>(pattern);
  const tracksRef = useRef<Record<DrumId, TrackState>>(tracks);
  const isPlayingRef = useRef(isPlaying);
  patternRef.current = pattern;
  tracksRef.current = tracks;
  isPlayingRef.current = isPlaying;

  // Queued load — applied at the next cycle boundary (idx === 0)
  const pendingLoadRef = useRef<PendingLoad | null>(null);
  // Holds the incoming pattern for the audio thread until React state catches up
  const overridePatternRef = useRef<Pattern | null>(null);

  const engine = useMemo(() => getEngine(), []);
  const sequenceRef = useRef<Tone.Sequence | null>(null);

  // Wire sample status changes from the engine into React state.
  useEffect(() => {
    const sync = () => setSampleStatus({ ...engine.sampleStatus });
    engine.setOnSampleStatusChange(sync);
    sync();
    return () => engine.setOnSampleStatusChange(() => {});
  }, [engine]);

  // Tempo / swing
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    Tone.Transport.swing = swing / 100;
    Tone.Transport.swingSubdivision = "16n";
  }, [swing]);

  // Build the sequence once
  useEffect(() => {
    const seq = new Tone.Sequence(
      (time, idx) => {
        // ── Quantized pattern switch ──────────────────────────────────────
        // At the start of every 16-step cycle, apply any queued load so the
        // new pattern plays from beat 1 of the incoming bar.
        if (idx === 0 && pendingLoadRef.current) {
          const pending = pendingLoadRef.current;
          pendingLoadRef.current = null;

          // 1. Update audio refs immediately so this cycle uses the new data.
          overridePatternRef.current = pending.pattern;

          // Apply volume / mute changes to the tracks ref and engine right away
          // so mute checks below (and future steps) reflect the new settings.
          if (pending.volumes || pending.mutes) {
            const updatedTracks = { ...tracksRef.current };
            for (const t of TRACKS) {
              const vol = pending.volumes?.[t.id];
              const mute = pending.mutes?.[t.id];
              updatedTracks[t.id] = {
                ...updatedTracks[t.id],
                ...(vol !== undefined ? { volume: vol } : {}),
                ...(mute !== undefined ? { mute } : {}),
              };
              if (vol !== undefined) engine.setVolume(t.id, vol);
              if (mute !== undefined) engine.setMute(t.id, mute);
            }
            tracksRef.current = updatedTracks;
          }

          // 2. Sync BPM / swing to the transport immediately.
          Tone.Transport.bpm.value = pending.bpm;
          Tone.Transport.swing = pending.swing / 100;

          // 3. Flush React state on the next animation frame for UI updates.
          Tone.Draw.schedule(() => {
            setPattern(pending.pattern);
            setBpm(pending.bpm);
            setSwing(pending.swing);
            setTracks(tracksRef.current); // already updated above
            overridePatternRef.current = null;
            setHasPendingLoad(false);
          }, time);
        }

        // ── Normal playback ───────────────────────────────────────────────
        // Use the override pattern when one is freshly applied, otherwise
        // fall back to the React-state-backed ref.
        const pat = overridePatternRef.current ?? patternRef.current;
        const trk = tracksRef.current;
        const anySolo = Object.values(trk).some((t) => t.solo);
        for (const t of TRACKS) {
          if (!pat[t.id][idx]) continue;
          const s = trk[t.id];
          if (s.mute) continue;
          if (anySolo && !s.solo) continue;
          engine.trigger(t.id, time, 1);
        }
        Tone.Draw.schedule(() => setStep(idx), time);
      },
      Array.from({ length: STEPS }, (_, i) => i),
      "16n",
    );
    seq.start(0);
    sequenceRef.current = seq;
    return () => {
      seq.stop();
      seq.dispose();
      sequenceRef.current = null;
    };
  }, [engine]);

  const play = useCallback(async () => {
    await engine.start();
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
    setIsPlaying(true);
  }, [engine]);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setStep(-1);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) pause();
    else await play();
  }, [isPlaying, play, pause]);

  const toggleStep = useCallback(
    (id: DrumId, idx: number) => {
      setPattern((prev) => {
        const next = { ...prev, [id]: prev[id].slice() };
        next[id][idx] = !next[id][idx];
        return next;
      });
      // audible feedback on enable
      if (!patternRef.current[id][idx]) engine.preview(id);
    },
    [engine],
  );

  const clearPattern = useCallback(() => {
    setPattern(emptyPattern());
    // Reset all track volumes, mutes and solos back to defaults
    const defaults = defaultTracks();
    setTracks(defaults);
    for (const t of TRACKS) {
      engine.setVolume(t.id, 0);
      engine.setMute(t.id, false);
      engine.setSolo(t.id, false);
    }
  }, [engine]);

  const randomize = useCallback(() => {
    setPattern((prev) => {
      const next = {} as Pattern;
      // Probabilities tuned per drum role for musicality
      const probs: Partial<Record<DrumId, number>> = {
        kick: 0.35,
        snare: 0.18,
        clap: 0.18,
        hatC: 0.55,
        hatO: 0.18,
        ride: 0.15,
        crash: 0.04,
        rim: 0.1,
        tom: 0.08,
        shaker: 0.3,
        tamb: 0.18,
        conga: 0.15,
        snap: 0.12,
      };
      for (const t of TRACKS) {
        const p = probs[t.id] ?? 0.2;
        next[t.id] = Array.from({ length: STEPS }, () => Math.random() < p);
      }
      // ensure kick on 1 for groove
      next.kick[0] = true;
      void prev;
      return next;
    });
  }, []);

  const loadGenre = useCallback((genre: Genre) => {
    setPattern(genre.pattern);
    setBpm(genre.bpm);
    setSwing(genre.swing);
    setActiveGenreId(genre.id);
  }, []);

  /**
   * Load a pattern immediately when stopped, or queue it to apply at the next
   * cycle boundary (step 0) when the sequencer is running — quantized switching.
   */
  const scheduleLoad = useCallback(
    (data: PendingLoad) => {
      if (!isPlayingRef.current) {
        // Not playing — apply right away
        setPattern(data.pattern);
        setBpm(data.bpm);
        setSwing(data.swing);
        if (data.volumes || data.mutes) {
          setTracks((prev) => {
            const next = { ...prev };
            for (const t of TRACKS) {
              const vol = data.volumes?.[t.id];
              const mute = data.mutes?.[t.id];
              next[t.id] = {
                ...next[t.id],
                ...(vol !== undefined ? { volume: vol } : {}),
                ...(mute !== undefined ? { mute } : {}),
              };
              if (vol !== undefined) engine.setVolume(t.id, vol);
              if (mute !== undefined) engine.setMute(t.id, mute);
            }
            return next;
          });
        }
      } else {
        // Playing — queue for the next bar boundary
        pendingLoadRef.current = data;
        setHasPendingLoad(true);
      }
    },
    [engine],
  );

  const setTrackVolume = useCallback(
    (id: DrumId, db: number) => {
      setTracks((prev) => ({ ...prev, [id]: { ...prev[id], volume: db } }));
      engine.setVolume(id, db);
    },
    [engine],
  );

  const toggleMute = useCallback(
    (id: DrumId) => {
      setTracks((prev) => {
        const next = { ...prev[id], mute: !prev[id].mute };
        engine.setMute(id, next.mute);
        return { ...prev, [id]: next };
      });
    },
    [engine],
  );

  const setTrackMute = useCallback(
    (id: DrumId, mute: boolean) => {
      setTracks((prev) => ({ ...prev, [id]: { ...prev[id], mute } }));
      engine.setMute(id, mute);
    },
    [engine],
  );

  const toggleSolo = useCallback(
    (id: DrumId) => {
      setTracks((prev) => {
        const next = { ...prev[id], solo: !prev[id].solo };
        engine.setSolo(id, next.solo);
        return { ...prev, [id]: next };
      });
    },
    [engine],
  );

  const previewTrack = useCallback(
    (id: DrumId) => {
      engine.preview(id);
    },
    [engine],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Tone.Transport.stop();
    };
  }, []);

  return {
    state: {
      isPlaying,
      step,
      bpm,
      swing,
      pattern,
      tracks,
      sampleStatus,
      activeGenreId,
      hasPendingLoad,
    } satisfies SequencerState,
    setBpm,
    setSwing,
    setPattern,
    play,
    pause,
    stop,
    togglePlay,
    toggleStep,
    clearPattern,
    randomize,
    loadGenre,
    scheduleLoad,
    setTrackVolume,
    setTrackMute,
    toggleMute,
    toggleSolo,
    previewTrack,
    DEFAULT_BPM,
    DEFAULT_SWING,
  };
}

export type UseSequencerReturn = ReturnType<typeof useSequencer>;
