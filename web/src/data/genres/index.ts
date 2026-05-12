import { emptyPattern, steps, type Pattern, type DrumId } from "../tracks";

export interface Genre {
  id: string;
  name: string;
  bpm: number;
  swing: number; // 0..100
  description: string;
  notes: string;
  tags: string[];
  pattern: Pattern;
}

function build(parts: Partial<Record<DrumId, boolean[]>>): Pattern {
  const p = emptyPattern();
  for (const k of Object.keys(parts) as DrumId[]) {
    const v = parts[k];
    if (v) p[k] = v;
  }
  return p;
}

export const GENRES: Genre[] = [
  {
    id: "motor-city-techno",
    name: "Motor City Techno",
    bpm: 128,
    swing: 4,
    description: "Detroit. Stripped. Hypnotic.",
    notes: "Four-on-the-floor kick, off-beat open hats, sparse claps on 5 and 13. Let the snare breathe.",
    tags: ["techno", "detroit", "warehouse", "dark", "hypnotic"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      hatC: steps(2, 6, 10, 14),
      hatO: steps(2, 10),
      clap: steps(4, 12),
      rim: steps(7),
    }),
  },
  {
    id: "analogue-techno",
    name: "Analogue Techno",
    bpm: 132,
    swing: 6,
    description: "TR-909 chug. Driving.",
    notes: "Closed hats every step, kick on every quarter, clap reinforcement on 2 & 4.",
    tags: ["techno", "909", "driving", "peak time"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      hatC: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      hatO: steps(6, 14),
      clap: steps(4, 12),
      tom: steps(15),
    }),
  },
  {
    id: "deep-tech-house",
    name: "Deep Tech-House",
    bpm: 124,
    swing: 14,
    description: "Rolling. Late-night. Subtle.",
    notes: "Bouncy shuffle. Tight closed hats with shaker carrying the groove.",
    tags: ["tech house", "deep", "rolling", "groove", "shuffle"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      hatC: steps(2, 6, 10, 14),
      shaker: steps(0, 2, 4, 6, 8, 10, 12, 14),
      clap: steps(4, 12),
      rim: steps(10),
    }),
  },
  {
    id: "chicago-house",
    name: "Chicago House",
    bpm: 122,
    swing: 18,
    description: "Jackin'. Soulful. Snapping.",
    notes: "Off-beat open hats are everything. Add claps and tambourine on the backbeat.",
    tags: ["house", "chicago", "classic", "jackin"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      hatO: steps(2, 6, 10, 14),
      clap: steps(4, 12),
      tamb: steps(4, 12),
      snap: steps(6, 14),
    }),
  },
  {
    id: "big-house",
    name: "Big House",
    bpm: 126,
    swing: 2,
    description: "Festival. Wide. Punchy.",
    notes: "Loud kick, sharp clap on backbeat, ride articulating eighth notes.",
    tags: ["house", "festival", "big room", "edm"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      clap: steps(4, 12),
      hatC: steps(2, 6, 10, 14),
      ride: steps(0, 2, 4, 6, 8, 10, 12, 14),
      crash: steps(0),
    }),
  },
  {
    id: "soulful-deep-house",
    name: "Soulful Deep House",
    bpm: 120,
    swing: 22,
    description: "Warm. Late. Heartfelt.",
    notes: "Heavy swing. Conga adds a Latin flavour. Snare in place of clap for warmth.",
    tags: ["deep house", "soulful", "warm", "latin"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      snare: steps(4, 12),
      hatC: steps(2, 6, 10, 14),
      hatO: steps(10),
      conga: steps(3, 7, 11, 15),
      shaker: steps(1, 5, 9, 13),
    }),
  },
  {
    id: "dusty-hip-hop",
    name: "Dusty Hip Hop",
    bpm: 88,
    swing: 30,
    description: "Boom bap. Crackle. Headnod.",
    notes: "Heavy swing, snare on 5 and 13, ghost kicks, sparse hats with a snap accent.",
    tags: ["hip hop", "boom bap", "lofi", "dusty"],
    pattern: build({
      kick: steps(0, 6, 8),
      snare: steps(4, 12),
      hatC: steps(0, 2, 4, 6, 8, 10, 12, 14),
      snap: steps(14),
      rim: steps(7),
    }),
  },
  {
    id: "chillwave",
    name: "Chillwave",
    bpm: 96,
    swing: 12,
    description: "Hazy. Dreamy. Smooth.",
    notes: "Soft kick, brushy hats, tambourine carries the off-beats.",
    tags: ["chillwave", "lofi", "dreamy", "ambient", "chill"],
    pattern: build({
      kick: steps(0, 8),
      snare: steps(4, 12),
      hatC: steps(2, 6, 10, 14),
      tamb: steps(1, 3, 5, 7, 9, 11, 13, 15),
      shaker: steps(0, 4, 8, 12),
    }),
  },
  {
    id: "pop-dubstep",
    name: "Pop Dubstep",
    bpm: 140,
    swing: 0,
    description: "Halftime. Wide. Anthemic.",
    notes: "Halftime feel: snare lands on 9. Tight ride articulates the bar.",
    tags: ["dubstep", "halftime", "pop", "anthem", "drop"],
    pattern: build({
      kick: steps(0, 10),
      snare: steps(8),
      hatC: steps(0, 2, 4, 6, 8, 10, 12, 14),
      ride: steps(4, 12),
      crash: steps(0),
    }),
  },
  {
    id: "incessant-dnb",
    name: "Incessant D&B",
    bpm: 174,
    swing: 0,
    description: "Breakbeat fury. Rolling.",
    notes: "Classic two-step: kick on 1 & 11, snare on 5 & 13. Ride steady eighths.",
    tags: ["dnb", "drum and bass", "jungle", "breakbeat", "fast"],
    pattern: build({
      kick: steps(0, 10),
      snare: steps(4, 12),
      hatC: steps(2, 6, 10, 14),
      ride: steps(0, 2, 4, 6, 8, 10, 12, 14),
      tom: steps(15),
    }),
  },
  {
    id: "classic-trance",
    name: "Classic Trance",
    bpm: 138,
    swing: 0,
    description: "Euphoric. Ride forward.",
    notes: "Driving kick, open hat on every off-beat, ride doubling for energy.",
    tags: ["trance", "classic", "euphoric", "anthem"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      hatO: steps(2, 6, 10, 14),
      clap: steps(4, 12),
      ride: steps(0, 2, 4, 6, 8, 10, 12, 14),
      crash: steps(0),
    }),
  },
  {
    id: "hardstyle-edm",
    name: "Hardstyle EDM",
    bpm: 150,
    swing: 0,
    description: "Distorted kicks. Aggressive.",
    notes: "Pounding kick, screaming claps, crash on the one.",
    tags: ["hardstyle", "edm", "aggressive", "hard"],
    pattern: build({
      kick: steps(0, 4, 8, 12),
      clap: steps(4, 12),
      hatC: steps(2, 6, 10, 14),
      crash: steps(0, 8),
      tom: steps(15),
    }),
  },
  {
    id: "jack-u-edm",
    name: "Jack Ü EDM",
    bpm: 100,
    swing: 4,
    description: "Trap-leaning. Bouncy. Cheeky.",
    notes: "Trap-flavoured shuffle: hats on 16ths, kick syncopated, snap reinforces.",
    tags: ["edm", "trap", "jack u", "bouncy"],
    pattern: build({
      kick: steps(0, 7, 10),
      snare: steps(4, 12),
      hatC: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      snap: steps(4, 12),
      crash: steps(0),
    }),
  },
];

export function getGenre(id: string): Genre | undefined {
  return GENRES.find((g) => g.id === id);
}
