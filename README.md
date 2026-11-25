# dsp-shared

Code that the **DSP Intranet** and **ESS** share, kept in ONE place, so a change here reaches both apps and nobody has to hunt for a second copy.

Today it holds one file:

| File | What it does | Used by |
|---|---|---|
| `src/nameHelper.ts` | the name rules: skip prefixes (MOHD, MD, DR, SHRI ...), the call-name and the initials ("MOHD ANWAR ULLAH" is called Anwar, badge "AU") | the intranet (TopBar, HomepageNew) and ESS (`src/lib/mask.ts`) |

## Changing something
1. Edit the file **here** (and nowhere else).
2. `npm test` (needs `npm install` once).
3. Commit and push this repo.
4. In each app run `npm run shared:update` (it installs the newest commit of this repo). Then commit the app's changed `package-lock.json`.

The one thing still kept by hand: the intranet's SQL function `public.name_prefixes()` has its own copy of the prefix list; when a prefix is added here, add it there too.

## How an app uses it
```ts
import { getFriendlyFirstName, getInitials } from "dsp-shared/nameHelper";
```
The package ships TypeScript source, so the app's `next.config.js` lists it in `transpilePackages: ["dsp-shared"]`.

This repo is public on purpose: it holds only the name rules, and a public repo installs on Vercel with no access token.
