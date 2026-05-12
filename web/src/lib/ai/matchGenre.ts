import { GENRES, type Genre } from "@/data/genres";

/**
 * Mock AI matcher. Scores each genre against the prompt using:
 *  - tag keyword matches (weight 3)
 *  - name/description token matches (weight 2)
 *  - bpm hints in the prompt (weight 4)
 *
 * Designed so a real LLM call can be swapped in by exporting the same
 * signature: (prompt: string) => Promise<{ genre: Genre; score: number; reason: string }>
 */
export interface MatchResult {
  genre: Genre;
  score: number;
  reason: string;
}

const STOP = new Set([
  "a", "an", "the", "and", "or", "of", "to", "with", "for", "on", "in", "is", "very",
  "i", "want", "make", "give", "me", "feel", "feels", "like", "vibe", "vibes",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

export function matchGenre(prompt: string): MatchResult {
  const tokens = tokenize(prompt);
  const bpmMatch = prompt.match(/(\d{2,3})\s*bpm/i);
  const targetBpm = bpmMatch ? parseInt(bpmMatch[1], 10) : null;

  let best: Genre = GENRES[0];
  let bestScore = -Infinity;
  let bestReason = "";

  for (const g of GENRES) {
    let score = 0;
    const matched: string[] = [];

    const bagTags = new Set(g.tags.map((t) => t.toLowerCase()));
    const bagName = new Set(tokenize(g.name));
    const bagDesc = new Set(tokenize(`${g.description} ${g.notes}`));

    for (const tok of tokens) {
      if (bagTags.has(tok)) {
        score += 3;
        matched.push(tok);
      } else if (bagName.has(tok)) {
        score += 2;
        matched.push(tok);
      } else if (bagDesc.has(tok)) {
        score += 1;
        matched.push(tok);
      }
      // partial tag match
      for (const t of bagTags) {
        if (t.includes(tok) && t !== tok && tok.length >= 4) {
          score += 1.5;
        }
      }
    }

    if (targetBpm !== null) {
      const diff = Math.abs(g.bpm - targetBpm);
      score += Math.max(0, 4 - diff / 6);
    }

    // small bonus for genres whose names appear directly
    if (prompt.toLowerCase().includes(g.name.toLowerCase())) {
      score += 5;
      matched.push(g.name);
    }

    if (score > bestScore) {
      bestScore = score;
      best = g;
      bestReason =
        matched.length > 0
          ? `Matched on ${Array.from(new Set(matched)).slice(0, 4).join(", ")}`
          : "No clear keyword match — picked closest by feel.";
    }
  }

  // fallback to a sensible default if nothing matched
  if (bestScore <= 0) {
    best = GENRES.find((g) => g.id === "deep-tech-house") ?? GENRES[0];
    bestReason = "Nothing specific detected — defaulting to Deep Tech-House.";
    bestScore = 0;
  }

  return { genre: best, score: bestScore, reason: bestReason };
}
