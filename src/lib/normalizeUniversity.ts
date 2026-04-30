// Smart-normalize for dedup: strip diacritics, lowercase, collapse non-alnum.
// Also expand a few common abbreviations so "Univ." and "University" collapse.
const ABBREV: Array<[RegExp, string]> = [
  [/\buniv\b\.?/g, "university"],
  [/\binst\b\.?/g, "institute"],
  [/\btech\b\.?/g, "technology"],
  [/\bcoll\b\.?/g, "college"],
  [/\bnatl\b\.?/g, "national"],
  [/\bintl\b\.?/g, "international"],
  [/\bdept\b\.?/g, "department"],
  [/\bst\b\.?/g, "saint"],
];

export function normalizeUniversityName(input: string): string {
  let s = (input ?? "").toString();
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.toLowerCase();
  for (const [re, rep] of ABBREV) s = s.replace(re, rep);
  s = s.replace(/&/g, " and ");
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s;
}
