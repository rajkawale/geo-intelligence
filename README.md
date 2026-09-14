# GEO I

Tracks what users actually ask on LLMs, learns from it, and closes the loop to improve GEO. Not a visibility dashboard.

## Stack

- **Frontend** — Next.js (React) → Vercel
- **Backend / jobs** — Node service → Railway
- **Data** — Supabase (Postgres), a dedicated `geoi` schema
- **LLM** — Gemini (answer generation)
- **Prompt data** — Profound (real-user prompts)

This is a separate product from KOS. Do not touch KOS infra or code.

## Structure

```
db/migrations/      SQL migrations (schema lives in the geoi schema)
db/seed/            mock seed data for the demo
backend/src/        Node service: Profound fetch, Gemini runs, metric compute, read API
frontend/           Next.js app
.env.example        environment template
```

## Setup

1. Create a new Supabase project (GEO I's own account, not KOS).
2. `cp .env.example .env` and fill in Supabase, Profound, and Gemini values.
3. Run the migrations in `db/migrations/` **in order** against the new project's
   SQL editor (001, then 002, then 003 — each has a comment explaining why it
   exists). 003 is required for the Phase 1 real query explorer.
4. `cd backend && npm install && npm run job:fetch-profound` to pull real
   Wegovy/Ozempic/CagriSema data from Profound into `geoi.profound_runs`.
5. Start the backend (`npm run start` in `backend/`), then the frontend
   (`npm run dev` in `frontend/`) — the `/queries` route reads from the
   backend's `/api/profound-runs*` endpoints (`NEXT_PUBLIC_GEOI_API_URL`).

See `07_product_spec/` for the current spec and roadmap — the product spec is
the plan; this README is just the run instructions.

## Status

- [x] Schema (initial migration + 003 for real Profound runs)
- [x] Backend — Profound (real, paginated) + Gemini (internal narration only) + read API
- [x] Frontend — Next.js, real `/queries` explorer (Phase 1), `/analysis` gap doc; main `/` dashboard still mock
- [ ] Seed data (`db/seed/` is still empty; real data now comes from `job:fetch-profound` instead)
- [ ] Deploy (Vercel/Railway — not yet deployed)
