# dsp-shared

Code that the **DSP Intranet**, **ESS** and **IMS** share, kept in ONE place, so a change here reaches both apps and nobody has to hunt for a second copy.

Today it holds four files:

| File | What it does | Used by |
|---|---|---|
| `src/nameHelper.ts` | the name rules: skip prefixes (MOHD, MD, DR, SHRI ...), the call-name and the initials ("MOHD ANWAR ULLAH" is called Anwar, badge "AU") | the intranet (TopBar, HomepageNew) and ESS (`src/lib/mask.ts`) |
| `src/gateCodes.ts` | the one-time codes of the intranet's application buttons: make a code, keep only its SHA-256 for 60 seconds, redeem it ONCE (the store is each app's own) | ESS (`/api/gate`, `/enter`) and IMS (`app/api/gate`, `app/enter`) |
| `src/outsideAccounts.ts` | the logins that are not a DSP employee's: the two vendors' shared logins (`network.amc`, `biometric.amc`) and their roles, which may open IMS only and never the intranet, ESS or the intranet's buttons; and the retired department logins `telecom` and `etl`, which nobody may use (a DSP employee who works in Telecom or ETL is not one of them) | IMS (the password check and the gate), ESS (sign-in and gate) |
| `src/gateConfig.ts` | which web origin (the intranet's, `INTRANET_ORIGIN`) may ask an app for a code | the same two doors |

## Changing something
1. Edit the file **here** (and nowhere else).
2. `npm test` (needs `npm install` once; it runs the name tests and the one-time-code tests).
3. Commit and push this repo.
4. In each app run `npm run shared:update` (it installs the newest commit of this repo). Then commit the app's changed `package-lock.json`.

The one thing still kept by hand: the intranet's SQL function `public.name_prefixes()` has its own copy of the prefix list; when a prefix is added here, add it there too.

## How an app uses it
```ts
import { getFriendlyFirstName, getInitials } from "dsp-shared/nameHelper";
```
The package ships TypeScript source, so the app's `next.config.js` lists it in `transpilePackages: ["dsp-shared"]`. `gateCodes` needs `luxon` in the app (it takes and gives Luxon DateTimes).

This repo is public on purpose: it holds only the name rules, and a public repo installs on Vercel with no access token.
