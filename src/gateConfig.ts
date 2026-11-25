// src/gateConfig.ts
//
// Which web page may ask an app (ESS, IMS ...) for a one-time code.
//   intranetOrigin()  the ONE web origin whose password pop-up may call POST /api/gate (CORS), e.g. "https://my-intranet.vercel.app" (scheme + host + port, no path, no trailing slash).
// It comes from the environment (INTRANET_ORIGIN). In development it defaults to http://localhost:3000 (the intranet's port); in production there is NO default: a missing value means "not configured" and the code door refuses everybody
// (the app's own sign-in page still works, so a mistake in the settings never locks anybody out).
// Exports: intranetOrigin. Read by: each app's /api/gate route.

/** The intranet's origin, or null when it is not configured (production without INTRANET_ORIGIN). */
export function intranetOrigin(): string | null {
  const explicit = (process.env.INTRANET_ORIGIN ?? "").trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null;
}
