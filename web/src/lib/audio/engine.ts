import * as Tone from "tone";
import type { DrumId } from "@/data/tracks";

/**
 * Audio engine. Each track has a Channel for volume/mute/solo and a
 * synth voice (always available) + optional sample Player (used when loaded).
 *
 * The engine is intentionally synth-first so playback works instantly
 * without any network. Sample loading is fire-and-forget: if a sample
 * loads, the player is used in preference to the synth.
 */

type Voice = {
  trigger: (time: number, velocity?: number) => void;
  dispose: () => void;
};

interface TrackVoice {
  channel: Tone.Channel;
  synth: Voice;
  player?: Tone.Player;
  playerReady: boolean;
}

// Optional sample URLs. Failure to load is silently ignored — we fall back to synthesis.
const SAMPLE_URLS: Partial<Record<DrumId, string>> = {
  kick: "https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3",
  snare: "https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3",
  hatC: "https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3",
  hatO: "https://tonejs.github.io/audio/drum-samples/CR78/hihat-open.mp3",
};

function makeSynthVoice(id: DrumId, out: Tone.InputNode): Voice {
  switch (id) {
    case "kick": {
      const s = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.4 },
      }).connect(out);
      return {
        trigger: (t, v = 1) => s.triggerAttackRelease("C2", "8n", t, v),
        dispose: () => s.dispose(),
      };
    }
    case "snare": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
      });
      const filter = new Tone.Filter(1800, "highpass");
      noise.chain(filter, out);
      return {
        trigger: (t, v = 1) => noise.triggerAttackRelease("16n", t, v * 0.9),
        dispose: () => {
          noise.dispose();
          filter.dispose();
        },
      };
    }
    case "clap": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "pink" },
        envelope: { attack: 0.002, decay: 0.22, sustain: 0 },
      });
      const filter = new Tone.Filter(1200, "bandpass", -12);
      filter.Q.value = 1.2;
      noise.chain(filter, out);
      return {
        trigger: (t, v = 1) => {
          noise.triggerAttackRelease("32n", t, v);
          noise.triggerAttackRelease("32n", t + 0.012, v * 0.7);
          noise.triggerAttackRelease("16n", t + 0.025, v * 0.85);
        },
        dispose: () => {
          noise.dispose();
          filter.dispose();
        },
      };
    }
    case "hatC": {
      const m = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      });
      const hp = new Tone.Filter(7000, "highpass");
      m.chain(hp, out);
      return {
        trigger: (t, v = 1) => m.triggerAttackRelease("32n", t, v * 0.4),
        dispose: () => {
          m.dispose();
          hp.dispose();
        },
      };
    }
    case "hatO": {
      // NoiseSynth avoids MetalSynth's monophonic re-trigger suppression
      const noise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.42, sustain: 0.01, release: 0.22 },
      });
      const hp = new Tone.Filter(6200, "highpass");
      noise.chain(hp, out);
      return {
        trigger: (t, v = 1) => noise.triggerAttackRelease("8n", t, v * 0.85),
        dispose: () => {
          noise.dispose();
          hp.dispose();
        },
      };
    }
    case "ride": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.75, sustain: 0.004, release: 0.35 },
      });
      const hp = new Tone.Filter(7500, "highpass");
      // Subtle bell ping layered on top
      const bell = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 },
      });
      bell.volume.value = -18;
      noise.chain(hp, out);
      bell.connect(out);
      return {
        trigger: (t, v = 1) => {
          noise.triggerAttackRelease("4n", t, v * 0.65);
          bell.triggerAttackRelease("C6", "16n", t, v * 0.5);
        },
        dispose: () => {
          noise.dispose();
          hp.dispose();
          bell.dispose();
        },
      };
    }
    case "crash": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 1.8, sustain: 0.02, release: 0.9 },
      });
      const hp = new Tone.Filter(3200, "highpass");
      noise.chain(hp, out);
      return {
        trigger: (t, v = 1) => noise.triggerAttackRelease("2n", t, v * 0.9),
        dispose: () => {
          noise.dispose();
          hp.dispose();
        },
      };
    }
    case "rim": {
      const s = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
      });
      const f = new Tone.Filter(2200, "bandpass");
      s.chain(f, out);
      return {
        trigger: (t, v = 1) => s.triggerAttackRelease("E4", "32n", t, v * 0.8),
        dispose: () => {
          s.dispose();
          f.dispose();
        },
      };
    }
    case "tom": {
      const s = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0 },
      }).connect(out);
      return {
        trigger: (t, v = 1) => s.triggerAttackRelease("A2", "8n", t, v * 0.9),
        dispose: () => s.dispose(),
      };
    }
    case "shaker": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.005, decay: 0.07, sustain: 0 },
      });
      const f = new Tone.Filter(6500, "highpass");
      noise.chain(f, out);
      return {
        trigger: (t, v = 1) => noise.triggerAttackRelease("32n", t, v * 0.6),
        dispose: () => {
          noise.dispose();
          f.dispose();
        },
      };
    }
    case "tamb": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.07 },
      });
      const hp = new Tone.Filter(7000, "highpass");
      noise.chain(hp, out);
      return {
        trigger: (t, v = 1) => noise.triggerAttackRelease("32n", t, v * 0.75),
        dispose: () => {
          noise.dispose();
          hp.dispose();
        },
      };
    }
    case "conga": {
      const s = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 3,
        envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
      }).connect(out);
      return {
        trigger: (t, v = 1) => s.triggerAttackRelease("D3", "16n", t, v * 0.85),
        dispose: () => s.dispose(),
      };
    }
    case "snap": {
      const noise = new Tone.NoiseSynth({
        noise: { type: "pink" },
        envelope: { attack: 0.001, decay: 0.06, sustain: 0 },
      });
      const f = new Tone.Filter(2400, "bandpass");
      f.Q.value = 2;
      noise.chain(f, out);
      return {
        trigger: (t, v = 1) => noise.triggerAttackRelease("32n", t, v * 0.85),
        dispose: () => {
          noise.dispose();
          f.dispose();
        },
      };
    }
  }
}

export type SampleStatus = "synth" | "loading" | "ready" | "error";

export class AudioEngine {
  private voices = new Map<DrumId, TrackVoice>();
  private master: Tone.Channel;
  private limiter: Tone.Limiter;
  private started = false;
  public sampleStatus: Partial<Record<DrumId, SampleStatus>> = {};
  private onSampleStatusChange?: () => void;

  constructor() {
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Channel({ volume: -4 }).connect(this.limiter);
  }

  setOnSampleStatusChange(fn: () => void) {
    this.onSampleStatusChange = fn;
  }

  /** Lazy build of a voice. */
  private getVoice(id: DrumId): TrackVoice {
    let v = this.voices.get(id);
    if (v) return v;
    const channel = new Tone.Channel({ volume: 0 }).connect(this.master);
    const synth = makeSynthVoice(id, channel);
    v = { channel, synth, playerReady: false };
    this.voices.set(id, v);

    const url = SAMPLE_URLS[id];
    if (url) {
      this.sampleStatus[id] = "loading";
      this.onSampleStatusChange?.();
      const player = new Tone.Player({
        url,
        autostart: false,
        onload: () => {
          v!.playerReady = true;
          this.sampleStatus[id] = "ready";
          this.onSampleStatusChange?.();
        },
        onerror: () => {
          this.sampleStatus[id] = "error";
          this.onSampleStatusChange?.();
        },
      }).connect(channel);
      v.player = player;
    } else {
      this.sampleStatus[id] = "synth";
    }
    return v;
  }

  async start() {
    if (this.started) return;
    await Tone.start();

    // ── iOS speaker-routing fix ───────────────────────────────────────────
    // On iPhone, Web Audio defaults to the earpiece (phone-call route)
    // unless we immediately push a buffer through the destination after the
    // AudioContext resumes. Playing even a 1-sample silent buffer tells iOS
    // to switch to the "media playback" audio session, which routes to the
    // built-in loudspeaker.  This must happen right after Tone.start()
    // resolves so we are still within the user-gesture microtask window.
    try {
      const ctx = Tone.getContext().rawContext as AudioContext;
      const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      // Non-fatal — some environments won't reach here, that's fine.
    }

    this.started = true;
  }

  trigger(id: DrumId, time: number, velocity = 1) {
    const v = this.getVoice(id);
    if (v.playerReady && v.player) {
      try {
        v.player.start(time);
        return;
      } catch {
        // fall through to synth
      }
    }
    v.synth.trigger(time, velocity);
  }

  /** Preview a hit immediately (UI feedback). */
  preview(id: DrumId) {
    void this.start();
    this.trigger(id, Tone.now() + 0.01, 1);
  }

  setVolume(id: DrumId, db: number) {
    const v = this.getVoice(id);
    v.channel.volume.value = db;
  }

  setMute(id: DrumId, mute: boolean) {
    const v = this.getVoice(id);
    v.channel.mute = mute;
  }

  setSolo(id: DrumId, solo: boolean) {
    const v = this.getVoice(id);
    v.channel.solo = solo;
  }

  setMasterVolume(db: number) {
    this.master.volume.value = db;
  }

  dispose() {
    for (const v of this.voices.values()) {
      v.synth.dispose();
      v.player?.dispose();
      v.channel.dispose();
    }
    this.voices.clear();
    this.master.dispose();
    this.limiter.dispose();
  }
}

// Singleton — created lazily on the client.
let _engine: AudioEngine | null = null;
export function getEngine(): AudioEngine {
  if (!_engine) _engine = new AudioEngine();
  return _engine;
}
