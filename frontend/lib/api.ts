// Single place that knows the backend URL and the shared-secret key, so every
// call site gets the auth header for free instead of each fetch() needing to
// remember it. See the comment on GEOI_API_KEY in .env — this is a gate, not
// real per-user auth.
const API_BASE = process.env.NEXT_PUBLIC_GEOI_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_GEOI_API_KEY;

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (API_KEY) headers.set("x-api-key", API_KEY);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
