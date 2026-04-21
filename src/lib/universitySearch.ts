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

/**
 * Score a university name against a query. Higher = better. 0 = no match.
 * Tiers (approx):
 *  1000 = exact normalized match
 *  900  = alias exact match
 *  800  = acronym exact / starts-with
 *  700  = word starts-with query
 *  600  = substring match (earlier = higher)
 *  500  = acronym contains query
 *  300  = fuzzy (typo tolerant) match
 */
export const scoreUniversity = (name: string, query: string): number => {
  const q = normalize(query);
  if (!q) return 1; // show all when query empty
  const n = normalize(name);
  if (!n) return 0;

  if (n === q) return 1000;

  // Alias check — does the query match any known alias whose expansion is in the name?
  const aliasTargets = ALIASES[q];
  if (aliasTargets) {
    for (const t of aliasTargets) {
      const tn = normalize(t);
      if (n === tn) return 950;
      if (n.includes(tn)) return 900;
    }
  }

  const acronym = acronymOf(name);
  if (acronym === q) return 850;
  if (acronym.startsWith(q) && q.length >= 2) return 800;

  // Word starts-with
  const words = n.split(" ");
  for (const w of words) {
    if (w.startsWith(q)) return 750;
  }

  // Substring — earlier match scores higher
  const idx = n.indexOf(q);
  if (idx !== -1) return 700 - Math.min(idx, 100);

  // Acronym contains
  if (acronym.includes(q) && q.length >= 2) return 500;

  // Each query token must appear (multi-word search like "iit bombay")
  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length > 1 && qTokens.every((t) => n.includes(t) || acronym.includes(t))) {
    return 600;
  }

  // Typo tolerance — only for single-token queries of reasonable length
  if (qTokens.length === 1 && q.length >= 4) {
    const max = q.length <= 5 ? 1 : q.length <= 8 ? 2 : 3;
    let best = max + 1;
    for (const w of words) {
      if (w.length < 3) continue;
      if (Math.abs(w.length - q.length) > max) continue;
      const d = editDistance(w, q, max);
      if (d < best) best = d;
      if (best === 0) break;
    }
    if (best <= max) return 350 - best * 50;
  }

  return 0;
};
