import type { Pattern } from "@/data/tracks";

const KEY = "rhythm-machine:patterns:v1";
const SETTINGS_KEY = "rhythm-machine:settings:v1";

// ── App settings (persisted across page loads) ───────────────────────────────

export interface AppSettings {
  activeGenreId: string | null;
  bpm: number;
  swing: number;
  /** Per-track volume (dB) and mute flags */
  tracks: Partial<Record<string, { volume: number; mute: boolean }>>;
}

export function loadSettings(): AppSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppSettings;
  } catch {
    return null;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export interface SavedPattern {
  id: string;
  name: string;
  bpm: number;
  swing: number;
  pattern: Pattern;
  /** Per-track volume overrides in dB. Optional for backwards compat with old saves. */
  volumes?: Partial<Record<string, number>>;
  /** Per-track mute flags. Optional for backwards compat with old saves. */
  mutes?: Partial<Record<string, boolean>>;
  createdAt: number;
}

export function loadPatterns(): SavedPattern[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPattern[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePatterns(list: SavedPattern[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
}

export function addPattern(p: Omit<SavedPattern, "id" | "createdAt">): SavedPattern {
  const list = loadPatterns();
  const entry: SavedPattern = {
    ...p,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };
  list.unshift(entry);
  savePatterns(list.slice(0, 30));
  return entry;
}

export function removePattern(id: string) {
  savePatterns(loadPatterns().filter((p) => p.id !== id));
}

export function renamePattern(id: string, name: string) {
  savePatterns(loadPatterns().map((p) => (p.id === id ? { ...p, name } : p)));
}
