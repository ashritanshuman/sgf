// Smart search ranking utilities for the university picker.
// Supports: substring, word-prefix, acronym matching, common aliases,
// and typo tolerance via bounded Levenshtein distance.

const ALIASES: Record<string, string[]> = {
  // Indian institutes
  "iit": ["indian institute of technology"],
  "iitb": ["indian institute of technology bombay"],
  "iitd": ["indian institute of technology delhi"],
  "iitk": ["indian institute of technology kanpur"],
  "iitkgp": ["indian institute of technology kharagpur"],
  "iitm": ["indian institute of technology madras"],
  "iitr": ["indian institute of technology roorkee"],
  "iitg": ["indian institute of technology guwahati"],
  "iith": ["indian institute of technology hyderabad"],
  "iitbhu": ["indian institute of technology bhu", "iit varanasi"],
  "nit": ["national institute of technology"],
  "nitt": ["national institute of technology tiruchirappalli", "nit trichy"],
  "nitk": ["national institute of technology karnataka", "nit surathkal"],
  "nitw": ["national institute of technology warangal"],
  "iiit": ["international institute of information technology", "indian institute of information technology"],
  "iiith": ["international institute of information technology hyderabad"],
  "iiitb": ["international institute of information technology bangalore"],
  "iisc": ["indian institute of science"],
  "bits": ["birla institute of technology and science"],
  "bitspilani": ["birla institute of technology and science pilani"],
  "vit": ["vellore institute of technology"],
  "vitc": ["vellore institute of technology chennai"],
  "vjti": ["veermata jijabai technological institute"],
  "coep": ["college of engineering pune"],
  "dtu": ["delhi technological university"],
  "nsut": ["netaji subhas university of technology"],
  "manit": ["maulana azad national institute of technology"],
  "mnit": ["malaviya national institute of technology"],
  "srm": ["srm institute of science and technology"],
  "sastra": ["sastra deemed university"],
  "psg": ["psg college of technology"],
  "mit": ["massachusetts institute of technology", "manipal institute of technology"],
  // US/global
  "ucb": ["university of california berkeley"],
  "ucla": ["university of california los angeles"],
  "ucsd": ["university of california san diego"],
  "usc": ["university of southern california"],
  "nyu": ["new york university"],
  "cmu": ["carnegie mellon university"],
  "gatech": ["georgia institute of technology", "georgia tech"],
  "ut": ["university of texas"],
  "uw": ["university of washington", "university of wisconsin"],
  "lse": ["london school of economics"],
  "ucl": ["university college london"],
  "ntu": ["nanyang technological university"],
  "nus": ["national university of singapore"],
  "hkust": ["hong kong university of science and technology"],
  "kaist": ["korea advanced institute of science and technology"],
  "tum": ["technical university of munich"],
  "epfl": ["ecole polytechnique federale de lausanne"],
  "eth": ["eth zurich", "swiss federal institute of technology"],
};

const normalize = (s: string): string =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const acronymOf = (s: string): string =>
  normalize(s)
    .split(" ")
    .filter((w) => w && !["of", "the", "and", "at", "for", "in"].includes(w))
    .map((w) => w[0])
    .join("");

// Bounded Levenshtein distance — early exit if distance exceeds `max`.
const editDistance = (a: string, b: string, max: number): number => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[n];
};

export interface ScoredUniversity {
  name: string;
  score: number;
}

export type MatchReason =
  | "exact"
  | "alias"
  | "acronym"
  | "prefix"
  | "substring"
  | "tokens"
  | "fuzzy"
  | "none";

export interface MatchSegment {
  text: string;
  highlight: boolean;
}

export interface MatchExplanation {
  score: number;
  reason: MatchReason;
  /** Short label shown next to the result (e.g. "Acronym: IIT"). */
  label?: string;
  /** The original name split into highlighted/non-highlighted segments. */
  segments: MatchSegment[];
}

const STOP_WORDS = new Set(["of", "the", "and", "at", "for", "in"]);

// Build segments from the ORIGINAL name string given char-index ranges
// computed against the normalized version. We re-walk the original to map
// normalized positions back to display positions so highlights line up.
const buildSegments = (
  original: string,
  highlightRanges: Array<[number, number]>
): MatchSegment[] => {
  if (highlightRanges.length === 0) return [{ text: original, highlight: false }];

  const normToOrig: number[] = [];
  let lastWasSpace = true;
  for (let i = 0; i < original.length; i++) {
    const ch = original[i];
    const lowered = ch
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
    const isAlnum = /[a-z0-9]/.test(lowered);
    if (isAlnum) {
      normToOrig.push(i);
      lastWasSpace = false;
    } else if (!lastWasSpace) {
      normToOrig.push(i);
      lastWasSpace = true;
    }
  }
  while (normToOrig.length && /\s/.test(original[normToOrig[normToOrig.length - 1]] ?? "")) {
    normToOrig.pop();
  }

  const origRanges: Array<[number, number]> = [];
  for (const [start, end] of highlightRanges) {
    if (end <= 0 || start >= normToOrig.length) continue;
    const s = normToOrig[Math.max(0, Math.min(start, normToOrig.length - 1))] ?? 0;
    const e = normToOrig[Math.max(0, Math.min(end - 1, normToOrig.length - 1))] ?? original.length - 1;
    origRanges.push([s, e + 1]);
  }
  origRanges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const r of origRanges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }

  const segs: MatchSegment[] = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) segs.push({ text: original.slice(cursor, s), highlight: false });
    segs.push({ text: original.slice(s, e), highlight: true });
    cursor = e;
  }
  if (cursor < original.length) segs.push({ text: original.slice(cursor), highlight: false });
  return segs;
};

const tokenRanges = (normalized: string, qTokens: string[]): Array<[number, number]> => {
  const ranges: Array<[number, number]> = [];
  for (const t of qTokens) {
    if (!t) continue;
    let from = 0;
    while (true) {
      const idx = normalized.indexOf(t, from);
      if (idx === -1) break;
      ranges.push([idx, idx + t.length]);
      from = idx + t.length;
    }
  }
  return ranges;
};

const acronymRanges = (normalized: string, qLen: number): Array<[number, number]> => {
  const ranges: Array<[number, number]> = [];
  const words = normalized.split(" ");
  let cursor = 0;
  let taken = 0;
  for (const w of words) {
    if (!w) { cursor += 1; continue; }
    if (!STOP_WORDS.has(w) && taken < qLen) {
      ranges.push([cursor, cursor + 1]);
      taken++;
    }
    cursor += w.length + 1;
    if (taken >= qLen) break;
  }
  return ranges;
};

/**
 * Explain a match: score, reason, short label, and highlight segments built
 * against the ORIGINAL display name.
 */
export const explainMatch = (name: string, query: string): MatchExplanation => {
  const q = normalize(query);
  if (!q) return { score: 1, reason: "none", segments: [{ text: name, highlight: false }] };
  const n = normalize(name);
  if (!n) return { score: 0, reason: "none", segments: [{ text: name, highlight: false }] };

  if (n === q) {
    return {
      score: 1000,
      reason: "exact",
      label: "Exact match",
      segments: buildSegments(name, [[0, n.length]]),
    };
  }

  const aliasTargets = ALIASES[q];
  if (aliasTargets) {
    for (const t of aliasTargets) {
      const tn = normalize(t);
      const idx = n.indexOf(tn);
      if (idx !== -1) {
        return {
          score: n === tn ? 950 : 900,
          reason: "alias",
          label: `${query.toUpperCase()} → ${t}`,
          segments: buildSegments(name, [[idx, idx + tn.length]]),
        };
      }
    }
  }

  const acronym = acronymOf(name);
  if (acronym === q || (acronym.startsWith(q) && q.length >= 2)) {
    return {
      score: acronym === q ? 850 : 800,
      reason: "acronym",
      label: `Acronym: ${acronym.slice(0, q.length).toUpperCase()}`,
      segments: buildSegments(name, acronymRanges(n, q.length)),
    };
  }

  const words = n.split(" ");
  let cursor = 0;
  for (const w of words) {
    if (w.startsWith(q)) {
      return {
        score: 750,
        reason: "prefix",
        label: "Starts with",
        segments: buildSegments(name, [[cursor, cursor + q.length]]),
      };
    }
    cursor += w.length + 1;
  }

  const idx = n.indexOf(q);
  if (idx !== -1) {
    return {
      score: 700 - Math.min(idx, 100),
      reason: "substring",
      label: "Contains",
      segments: buildSegments(name, [[idx, idx + q.length]]),
    };
  }

  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length > 1 && qTokens.every((t) => n.includes(t) || acronym.includes(t))) {
    return {
      score: 600,
      reason: "tokens",
      label: "All terms match",
      segments: buildSegments(name, tokenRanges(n, qTokens.filter((t) => n.includes(t)))),
    };
  }

  if (acronym.includes(q) && q.length >= 2) {
    return {
      score: 500,
      reason: "acronym",
      label: `Acronym: ${acronym.toUpperCase()}`,
      segments: buildSegments(name, acronymRanges(n, acronym.length)),
    };
  }

  if (qTokens.length === 1 && q.length >= 4) {
    const max = q.length <= 5 ? 1 : q.length <= 8 ? 2 : 3;
    let best = max + 1;
    let bestStart = -1;
    let bestLen = 0;
    let walker = 0;
    for (const w of words) {
      const wStart = walker;
      walker += w.length + 1;
      if (w.length < 3) continue;
      if (Math.abs(w.length - q.length) > max) continue;
      const d = editDistance(w, q, max);
      if (d < best) {
        best = d;
        bestStart = wStart;
        bestLen = w.length;
      }
      if (best === 0) break;
    }
    if (best <= max && bestStart >= 0) {
      return {
        score: 350 - best * 50,
        reason: "fuzzy",
        label: `Did you mean… (${best} edit${best === 1 ? "" : "s"})`,
        segments: buildSegments(name, [[bestStart, bestStart + bestLen]]),
      };
    }
  }

  return { score: 0, reason: "none", segments: [{ text: name, highlight: false }] };
};

/** Backwards-compatible numeric scorer. */
export const scoreUniversity = (name: string, query: string): number =>
  explainMatch(name, query).score;
