// Single place that knows the backend URL and the shared-secret key, so every
// call site gets the auth header for free instead of each fetch() needing to
// remember it. See the comment on GEOI_API_KEY in .env — this is a gate, not
// real per-user auth.
//
// The URL fallback below is the deployed Railway backend, not localhost —
// there's no Vercel env-var-management tool available in this session, and
// a hostname isn't sensitive, so it's safe to bake in as the working default.
// GEOI_API_KEY is NOT hardcoded here on purpose: this repo is public on
// GitHub, and a literal secret string in committed source sits in git
// history forever (indexable, scannable) — a materially worse exposure than
// a NEXT_PUBLIC_ var, even though both end up in the shipped browser bundle.
// It must be set as a real NEXT_PUBLIC_GEOI_API_KEY env var in the Vercel
// project dashboard (same value as Railway's GEOI_API_KEY) or every request
// from the deployed frontend gets a 401.
const API_BASE = process.env.NEXT_PUBLIC_GEOI_API_URL || "https://backend-production-afc5.up.railway.app";
const API_KEY = process.env.NEXT_PUBLIC_GEOI_API_KEY;

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (API_KEY) headers.set("x-api-key", API_KEY);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
