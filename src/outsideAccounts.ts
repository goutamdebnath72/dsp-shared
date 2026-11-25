// src/outsideAccounts.ts
//
// WHO MAY NOT BE A DSP EMPLOYEE'S LOGIN. IMS has two kinds of logins that are not a DSP employee's own ticket:
//   - the two VENDORS' shared logins: `network.amc` (network vendor) and `biometric.amc` (biometric vendor), one login for all of that vendor's staff. My strict rule (owner, 2026-11-25): such a login may sign in to IMS ONLY.
//     It must never open the DSP Intranet, never open ESS, and never get a one-time code from the intranet's buttons, even if a row with the same ticket ever appeared in the intranet's user table;
//   - the old DEPARTMENT logins `telecom` and `etl`, which are RETIRED (owner, 2026-11-25): Telecom and ETL staff now sign in with their own ticket and the intranet password, and IMS gives them their role from their department. Nobody may sign in with these two names any more.
// A DSP employee who works in Telecom or ETL has an ordinary ticket; only the IMS role (`telecom_user`, `etl`) differs. So only the two VENDOR roles are listed as roles.
// This file is the ONE place that says which logins those are; every app asks it. Exports: OUTSIDE_TICKETS, OUTSIDE_ROLES, RETIRED_TICKETS, isOutsideAccount(account), isRetiredLogin(ticket).
// To add another vendor, add it HERE, run `npm test`, commit and push, then run `npm run shared:update` in each app.

/** The vendors' shared logins (compared in lower case; the old `.vendor` names are kept so a half-migrated database cannot slip through). */
export const OUTSIDE_TICKETS: ReadonlySet<string> = new Set(["network.amc", "biometric.amc", "network.vendor", "biometric.vendor"]);

/** The IMS roles of the two vendors. (`telecom_user` and `etl` are NOT here: those are DSP employees.) */
export const OUTSIDE_ROLES: ReadonlySet<string> = new Set(["network_amc", "biometric_amc", "network_vendor", "biometric_vendor"]);

/** The department logins that no longer exist. Every app refuses them. */
export const RETIRED_TICKETS: ReadonlySet<string> = new Set(["telecom", "etl"]);

/** True when the login is a retired department login. */
export function isRetiredLogin(ticketNo: string | null | undefined): boolean {
  return RETIRED_TICKETS.has(String(ticketNo ?? "").trim().toLowerCase());
}

/** True when the account is a vendor's shared login or role, or a retired department login: by its login, by its vendor role, or because its login has a dot (an employee's ticket is a number; `name.amc` is never one). */
export function isOutsideAccount(account: { ticketNo?: string | null; role?: string | null }): boolean {
  const ticket = String(account.ticketNo ?? "").trim().toLowerCase();
  const role = String(account.role ?? "").trim().toLowerCase();
  return OUTSIDE_TICKETS.has(ticket) || RETIRED_TICKETS.has(ticket) || ticket.includes(".") || OUTSIDE_ROLES.has(role);
}
