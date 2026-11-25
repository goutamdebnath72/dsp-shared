// src/gateCodes.selftest.ts
// Run: npm test      (or: npx tsx src/gateCodes.selftest.ts)
import { DateTime } from "luxon";
import { CODE_TTL_SECONDS, hashCode, issueCode, newCode, redeemCode, type CodeStore } from "./gateCodes";

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = "") => { if (cond) pass++; else { fail++; console.log(`FAIL ${name}${detail ? ` (${detail})` : ""}`); } };
const done = () => { console.log(`${pass} passed, ${fail} failed`); if (fail) process.exit(1); };

/** An in-memory store that follows the same rule as the database one: consume() works once, only while unexpired. */
function memoryStore() {
  const rows = new Map<string, { ticketNo: string; expiresAt: DateTime; usedAt: DateTime | null }>();
  const store: CodeStore = {
    async insert(r) { rows.set(r.codeHash, { ticketNo: r.ticketNo, expiresAt: r.expiresAt, usedAt: null }); },
    async consume(h, now) {
      const r = rows.get(h);
      if (!r || r.usedAt || !(r.expiresAt > now)) return null;
      r.usedAt = now; return r.ticketNo;
    },
    async sweep(before) { for (const [h, r] of rows) if (r.expiresAt < before) rows.delete(h); },
  };
  return { store, rows };
}

async function main() {
  const t0 = DateTime.fromISO("2026-11-24T10:00:00Z");
  {
    const { store, rows } = memoryStore();
    const code = await issueCode(store, "D123456", "1.2.3.4", t0);
    ok("a code is 43 URL-safe characters (32 random bytes)", /^[A-Za-z0-9_-]{43}$/.test(code));
    ok("two codes are never the same", newCode() !== newCode());
    ok("only the SHA-256 of the code is stored, never the code", rows.has(hashCode(code)) && ![...rows.keys()].includes(code) && hashCode(code).length === 64);
    ok("a code lives exactly 60 seconds", CODE_TTL_SECONDS === 60 && rows.get(hashCode(code))!.expiresAt.toMillis() - t0.toMillis() === 60_000);
    ok("a code gives back the ticket it was issued for", (await redeemCode(store, code, t0.plus({ seconds: 5 }))) === "D123456");
    ok("a code works ONCE: the second try gives nothing", (await redeemCode(store, code, t0.plus({ seconds: 6 }))) === null);
  }
  {
    const { store } = memoryStore();
    const code = await issueCode(store, "D123456", null, t0);
    ok("a code after its 60 seconds gives nothing", (await redeemCode(store, code, t0.plus({ seconds: 61 }))) === null);
    const c2 = await issueCode(store, "D123456", null, t0);
    ok("a code at 59 seconds still works", (await redeemCode(store, c2, t0.plus({ seconds: 59 }))) === "D123456");
  }
  {
    const { store } = memoryStore();
    await issueCode(store, "D123456", null, t0);
    ok("a made-up code, an empty code, a short code and a huge code all give nothing",
      (await redeemCode(store, newCode(), t0)) === null && (await redeemCode(store, "", t0)) === null && (await redeemCode(store, "abc", t0)) === null && (await redeemCode(store, "x".repeat(500), t0)) === null);
    ok("a value that is not text gives nothing", (await redeemCode(store, undefined as unknown as string, t0)) === null && (await redeemCode(store, null as unknown as string, t0)) === null);
  }
  {
    const { store } = memoryStore();
    const a = await issueCode(store, "D111111", null, t0);
    const b = await issueCode(store, "D222222", null, t0);
    ok("each code belongs to its own ticket (one person's code never opens another's)", (await redeemCode(store, b, t0)) === "D222222" && (await redeemCode(store, a, t0)) === "D111111");
  }
  {
    const { store, rows } = memoryStore();
    await issueCode(store, "D111111", null, t0);
    ok("issuing a new code sweeps the ones that expired more than a day ago", (await issueCode(store, "D222222", null, t0.plus({ days: 2 })), rows.size === 1));
  }
  done();
}
main();
