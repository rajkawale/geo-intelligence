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
3. Run the migrations in `db/migrations/` against the new project.
4. Seed the demo data from `db/seed/`.
5. Start the backend (`backend/`), then the frontend (`frontend/`).

## Status

- [x] Schema (initial migration)
- [ ] Backend (Profound + Gemini + API)
- [ ] Frontend (Next.js)
- [ ] Seed data
- [ ] Deploy (gated on Supabase account + keys)
