import type { Pattern } from "@/data/tracks";

const KEY = "rhythm-machine:patterns:v1";

export interface SavedPattern {
  id: string;
  name: string;
  bpm: number;
  swing: number;
  pattern: Pattern;
  /** Per-track volume overrides in dB. Optional for backwards compat with old saves. */
  volumes?: Partial<Record<string, number>>;
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
