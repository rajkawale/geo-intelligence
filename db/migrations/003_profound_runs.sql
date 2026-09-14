-- GEO I — 003: real Profound runs (Phase 1 — real query explorer + content-gap diagnosis)
-- Run this in the GEO I project SQL editor AFTER 001_init.sql and 002_expose_and_seed.sql.
--
-- Why this file exists: geoi.real_user_prompts (from 001) only stores a prompt
-- and a volume number — it can't hold what Profound's /v2/prompts/answers
-- endpoint actually returns per run: the full answer, which brands got
-- mentioned, citation URLs, sentiment, and Profound's own classification
-- (topic, funnel stage, persona, branded/unbranded, priority tags). This table
-- stores that real payload, one row per real Profound run, across every brand
-- GEO I tracks (Wegovy, Ozempic, CagriSema today).

create table if not exists geoi.profound_runs (
  id uuid primary key default gen_random_uuid(),
  profound_run_id text not null unique,
  brand text not null,                    -- 'Wegovy' | 'Ozempic' | 'CagriSema'
  category_id text not null,              -- Profound's category_id for that brand
  run_date date not null,
  engine_name text not null,              -- ChatGPT | Google Gemini | Meta AI | Grok | ...
  topic text,
  topic_id text,
  persona text,                           -- e.g. 'HCP', null = general population
  region text,
  tags jsonb default '[]'::jsonb,         -- Profound's own tags: funnel stage, branded/unbranded, priority
  prompt_text text not null,
  profound_prompt_id text,
  response_text text,
  mentions jsonb default '[]'::jsonb,     -- brand names Profound found mentioned in the answer
  citations jsonb default '[]'::jsonb,    -- citation URLs the answer relied on
  sentiment_claims jsonb default '[]'::jsonb,
  brand_mentioned boolean not null default false,       -- computed: does `mentions` include this brand
  competitor_mentioned boolean not null default false,  -- computed: does `mentions` include a known competitor
  gap_status text not null default 'absent',            -- won | contested | lost | absent — see fetch-profound.js
  fetched_at timestamptz default now()
);

create index if not exists idx_profound_runs_brand on geoi.profound_runs(brand);
create index if not exists idx_profound_runs_gap on geoi.profound_runs(gap_status);
create index if not exists idx_profound_runs_date on geoi.profound_runs(run_date);
create index if not exists idx_profound_runs_engine on geoi.profound_runs(engine_name);

alter table geoi.profound_runs enable row level security;

create policy "demo read" on geoi.profound_runs for select to authenticated using (true);

-- Explicit grant (belt-and-suspenders alongside 002's default-privileges line,
-- which only auto-applies to tables created by the same role in the same session).
grant select, insert, update, delete on geoi.profound_runs to authenticated, service_role;

notify pgrst, 'reload schema';
