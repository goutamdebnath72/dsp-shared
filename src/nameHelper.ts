// src/nameHelper.ts
//
// THE ONE PLACE where DSP's name rules live, shared by the DSP Intranet and ESS. This is the intranet's former src/lib/utils/nameHelper.ts, moved here unchanged in behaviour.
// How a full name becomes the name people say and the letters in a round badge: "MOHD ANWAR ULLAH" is called Anwar, not Mohd, and his badge reads "AU", not "MA"; a prefix or honorific is never the name.
// Exports: COMMON_PREFIXES, getFriendlyFirstName(fullName), getInitials(fullName).
// Read by: both apps (the intranet's TopBar and HomepageNew, ESS's src/lib/mask.ts).
// To change a rule (for example to add a prefix), change it HERE, run the tests (npm test), commit and push, and then run `npm run shared:update` in each app; there is no second copy to remember.
// ONE thing is still kept by hand: the intranet's SQL function public.name_prefixes() (04_phonetic_setup.sql), which employee phonetic search uses, has its own copy of the list. When I add a prefix here, I add it there too.

/** My curated, case-insensitive list of prefixes and honorifics, widely used in South Asia and globally. A word on this list is skipped when a name is called. */
export const COMMON_PREFIXES = new Set([
  "MOHD",
  "MOHAMMAD",
  "MOHAMMED",
  "MUHAMMAD",
  "MUHAMMED",
  "MD",
  "MD.",
  "MR",
  "MR.",
  "MRS",
  "MRS.",
  "MS",
  "MS.",
  "DR",
  "DR.",
  "PROF",
  "PROF.",
  "SHRI",
  "SMT",
  "LATE",
  "KM",
  "KUMARI",
]);

/** Splits a name into its words and drops the prefixes; when every word is a prefix, the original words are kept (so a name is never empty). */
function getStructuralNameParts(fullName: string): string[] {
  const parts = fullName.trim().split(/\s+/);

  const filtered = parts.filter((part) => {
    const cleanPart = part.replace(/[.,:]/g, "").toUpperCase();
    return !COMMON_PREFIXES.has(cleanPart);
  });

  // If the entire name was filtered out as prefixes, I fall back to the original parts
  return filtered.length > 0 ? filtered : parts;
}

/**
 * Parses a full name and gives the true conversational call-name, as it is written in the record.
 * @param fullName - The full raw name string (e.g., "MOHD ANWAR ULLAH", "DR GOUTAM SEN")
 * @returns The first name that is not a prefix (e.g., "ANWAR", "GOUTAM"); "User" when there is no name
 */
export function getFriendlyFirstName(fullName: string | null | undefined): string {
  if (!fullName) return "User";
  const structuralParts = getStructuralNameParts(fullName);
  return structuralParts[0];
}

/**
 * Generates up to two initials from a name string and ignores common prefixes.
 * @param fullName - The full raw name string (e.g., "MOHD ANWAR ULLAH")
 * @returns The initials of the first two words that are not prefixes (e.g., "AU" instead of "MA"); "U" when there is no name
 */
export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return "U";
  const structuralParts = getStructuralNameParts(fullName);

  return structuralParts
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
