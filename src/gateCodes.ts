// src/gateCodes.ts
//
// THE ONE-TIME CODES of the intranet's application buttons (ESS, IMS ...), kept here so every app issues and redeems them by the SAME rules. There is no database inside, so every rule can be tested alone.
//   issueCode(store, ticketNo, ip, now)  makes a random code, stores only its SHA-256 with a 60-second life, and returns the code (the only time it exists in plain form).
//   redeemCode(store, code, now)         turns a code back into the ticket number it was issued for, ONCE: a second try, an expired code, a made-up code all give null.
// Exports: CODE_TTL_SECONDS, newCode, hashCode, issueCode, redeemCode, CodeStore.
// Read by: each app's door (/api/gate issues a code, /enter redeems it) and its own store (ESS: TypeORM on ess.gate_code; IMS: Prisma on gate_codes). The store is the only part that differs per app.
// An app that uses this needs `luxon` (this file takes and gives Luxon DateTimes).
// Why a code and not a signed ticket: a code proves nothing by itself; it is only a key to a row that ESS wrote after the app itself checked the password. Nobody who steals the intranet's secrets can make one.

import { createHash, randomBytes } from "node:crypto";
import { DateTime } from "luxon";

/** How long a code can be used after it is issued. */
export const CODE_TTL_SECONDS = 60;

/** Where the hashes live. consume() must be atomic: of two calls with the same hash, at most ONE may get the ticket. */
export interface CodeStore {
  insert(row: { codeHash: string; ticketNo: string; expiresAt: DateTime; ip: string | null }): Promise<void>;
  /** Marks an unused, unexpired code as used and returns its ticket number; null for anything else. */
  consume(codeHash: string, now: DateTime): Promise<string | null>;
  /** Deletes codes that expired before `before` (housekeeping). */
  sweep(before: DateTime): Promise<void>;
}

/** Makes a code: 32 random bytes as URL-safe text (43 characters). */
export const newCode = (): string => randomBytes(32).toString("base64url");

/** The SHA-256 of a code, as 64 hex characters (what the database keeps). */
export const hashCode = (code: string): string => createHash("sha256").update(code).digest("hex");

/** Issues a code for a ticket number that has just passed the password check. */
export async function issueCode(store: CodeStore, ticketNo: string, ip: string | null, now: DateTime = DateTime.now()): Promise<string> {
  const code = newCode();
  await store.insert({ codeHash: hashCode(code), ticketNo, expiresAt: now.plus({ seconds: CODE_TTL_SECONDS }), ip });
  // I clear codes that expired more than a day ago, so the table does not grow without end.
  await store.sweep(now.minus({ days: 1 })).catch(() => {});
  return code;
}

/** Redeems a code: the ticket number it was issued for, or null. A code works once. */
export async function redeemCode(store: CodeStore, code: string, now: DateTime = DateTime.now()): Promise<string | null> {
  if (typeof code !== "string" || code.length < 20 || code.length > 100) return null;
  return store.consume(hashCode(code), now);
}
