// src/nameHelper.selftest.ts
// Run: npm test      (or: npx tsx src/nameHelper.selftest.ts)

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = "") => { if (cond) pass++; else { fail++; console.log(`FAIL ${name}${detail ? ` (${detail})` : ""}`); } };

import { COMMON_PREFIXES, getFriendlyFirstName, getInitials } from "./nameHelper";

ok("MOHD ANWAR ULLAH is called ANWAR and his badge reads AU", getFriendlyFirstName("MOHD ANWAR ULLAH") === "ANWAR" && getInitials("MOHD ANWAR ULLAH") === "AU");
ok("an ordinary name is unchanged", getFriendlyFirstName("GOUTAM DEBNATH") === "GOUTAM" && getInitials("GOUTAM DEBNATH") === "GD");
ok("every prefix of the list is skipped, in any case and with a full stop", getFriendlyFirstName("DR GOUTAM SEN") === "GOUTAM" && getFriendlyFirstName("dr. goutam sen") === "goutam" && getFriendlyFirstName("MD. SAMIM") === "SAMIM" && getFriendlyFirstName("Shri Ram Kumar") === "Ram" && getFriendlyFirstName("MOHAMMED ALI") === "ALI" && getFriendlyFirstName("SMT SITA DEVI") === "SITA" && getFriendlyFirstName("KUMARI ASHA") === "ASHA");
ok("initials are the first letters of the first two words that are not prefixes", getInitials("MD SAMIM AKHTAR") === "SA" && getInitials("A B C") === "AB" && getInitials("Single") === "S");
ok("a name made only of prefixes is not emptied", getFriendlyFirstName("MOHD") === "MOHD" && getInitials("MOHD") === "M");
ok("no name gives the fallbacks 'User' and 'U'", getFriendlyFirstName(null) === "User" && getFriendlyFirstName(undefined) === "User" && getFriendlyFirstName("") === "User" && getInitials(null) === "U" && getInitials("") === "U");
ok("the list holds the 22 prefixes the intranet had", COMMON_PREFIXES.size === 22 && COMMON_PREFIXES.has("MOHD") && COMMON_PREFIXES.has("KUMARI"));
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
