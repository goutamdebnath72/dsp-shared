// src/outsideAccounts.selftest.ts
// Run: npm test      (or: npx tsx src/outsideAccounts.selftest.ts)
import { OUTSIDE_ROLES, OUTSIDE_TICKETS, RETIRED_TICKETS, isOutsideAccount, isRetiredLogin } from "./outsideAccounts";

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = "") => { if (cond) pass++; else { fail++; console.log(`FAIL ${name}${detail ? ` (${detail})` : ""}`); } };

ok("the two vendors' logins and the two retired department logins are all kept out of the intranet and ESS", ["network.amc", "biometric.amc", "telecom", "etl"].every((t) => isOutsideAccount({ ticketNo: t })));
ok("the login is recognised in any case and with stray spaces", isOutsideAccount({ ticketNo: "  Network.AMC " }) && isOutsideAccount({ ticketNo: "TELECOM" }));
ok("the old .vendor logins are still outside accounts", isOutsideAccount({ ticketNo: "network.vendor" }) && isOutsideAccount({ ticketNo: "biometric.vendor" }));
ok("a vendor role is recognised even when the login is something else", [...OUTSIDE_ROLES].every((r) => isOutsideAccount({ ticketNo: "123456", role: r })));
ok("a DSP employee in Telecom or ETL is NOT an outside account: his or her role is ordinary staff", !isOutsideAccount({ ticketNo: "123456", role: "telecom_user" }) && !isOutsideAccount({ ticketNo: "123456", role: "etl" }));
ok("a login with a dot is never an employee", isOutsideAccount({ ticketNo: "newvendor.amc" }) && isOutsideAccount({ ticketNo: "a.b" }));
ok("employees are not outside accounts, whatever their role", !isOutsideAccount({ ticketNo: "498301", role: "sys_admin" }) && !isOutsideAccount({ ticketNo: "497922", role: "admin" }) && !isOutsideAccount({ ticketNo: "123456", role: "standard" }) && !isOutsideAccount({ ticketNo: "123456" }));
ok("missing or empty input is not an outside account (the other checks refuse it)", !isOutsideAccount({}) && !isOutsideAccount({ ticketNo: null, role: null }) && !isOutsideAccount({ ticketNo: "", role: "" }));
ok("only telecom and etl are retired, in any case and with spaces; employees and vendors are not", isRetiredLogin("telecom") && isRetiredLogin(" ETL ") && !isRetiredLogin("network.amc") && !isRetiredLogin("498301") && !isRetiredLogin(null));
ok("the lists hold what the IMS code knows", OUTSIDE_TICKETS.size === 4 && OUTSIDE_ROLES.size === 4 && RETIRED_TICKETS.size === 2);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
