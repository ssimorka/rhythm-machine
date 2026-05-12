export type DrumId =
  | "kick"
  | "snare"
  | "clap"
  | "hatC"
  | "hatO"
  | "ride"
  | "crash"
  | "rim"
  | "tom"
  | "shaker"
  | "tamb"
  | "conga"
  | "snap";

export interface TrackDef {
  id: DrumId;
  label: string;
  short: string;
}

export const TRACKS: TrackDef[] = [
  { id: "kick", label: "Kick", short: "KCK" },
  { id: "snare", label: "Snare", short: "SNR" },
  { id: "clap", label: "Clap", short: "CLP" },
  { id: "hatC", label: "Hat C", short: "HHC" },
  { id: "hatO", label: "Hat O", short: "HHO" },
  { id: "ride", label: "Ride", short: "RIDE" },
  { id: "crash", label: "Crash", short: "CRSH" },
  { id: "rim", label: "Rim", short: "RIM" },
  { id: "tom", label: "Tom", short: "TOM" },
  { id: "shaker", label: "Shaker", short: "SHK" },
  { id: "tamb", label: "Tamb", short: "TMB" },
  { id: "conga", label: "Conga", short: "CNG" },
  { id: "snap", label: "Snap", short: "SNP" },
];

export const STEPS = 16;
export type Pattern = Record<DrumId, boolean[]>;

export function emptyPattern(): Pattern {
  const p = {} as Pattern;
  for (const t of TRACKS) p[t.id] = Array(STEPS).fill(false);
  return p;
}

/** Compact pattern helper: "1 5 9 13" → bool array */
export function steps(...indices: number[]): boolean[] {
  const arr = Array(STEPS).fill(false);
  for (const i of indices) arr[i] = true;
  return arr;
}
