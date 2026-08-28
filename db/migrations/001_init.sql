-- GEO I — initial schema
-- All tables live in a dedicated `geoi` schema. Nothing here touches KOS.

create schema if not exists geoi;

-- ---------------------------------------------------------------------------
-- Prompt taxonomy
-- ---------------------------------------------------------------------------

create table geoi.prompt_clusters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  intent text,
  journey_stage text,
  priority text default 'medium',
  created_at timestamptz default now()
);

create table geoi.prompts (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid references geoi.prompt_clusters(id) on delete set null,
  prompt_text text not null,
  prompt_type text default 'unbranded',      -- branded | unbranded
  market text,
  language text,
  intent text,
  journey_stage text,
  priority text default 'medium',
  active boolean default true,
  created_at timestamptz default now()
);

-- Real-user prompts fetched from Profound.
create table geoi.real_user_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_text text not null,
  volume integer,
  cluster_ref text,
  intent text,
  market text,
  source text default 'profound',
  fetched_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Engines and competitors
-- ---------------------------------------------------------------------------

create table geoi.engines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table geoi.competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  market text,
  indication text,
  lifecycle_stage text
);

-- ---------------------------------------------------------------------------
-- Sources and citations
-- ---------------------------------------------------------------------------

create table geoi.sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  domain text,
  source_type text,      -- owned | third-party | academic | government | earned | social | competitor
  authority_score numeric
);

-- ---------------------------------------------------------------------------
-- Answers (one row per tracked prompt per engine per run)
-- ---------------------------------------------------------------------------

create table geoi.answers (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references geoi.prompts(id) on delete cascade,
  engine_id uuid references geoi.engines(id) on delete set null,
  model_version text,
  answer_text text,
  visibility text default 'absent',   -- present | absent
  mention_type text,                  -- position_1 | top_3 | lower | mention_only | absent
  recommendation boolean default false,
  position integer,
  accuracy_score numeric,
  positioning_score numeric,
  brand_score numeric,
  run_batch_id uuid,
  run_at timestamptz default now()
);

create table geoi.citations (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references geoi.answers(id) on delete cascade,
  source_id uuid references geoi.sources(id) on delete set null,
  claim text,
  support_status text default 'requires_review',  -- valid | partial | invalid | requires_review
  freshness_months integer,
  persistence numeric
);

-- ---------------------------------------------------------------------------
-- Actions, reviews, knowledge base
-- ---------------------------------------------------------------------------

create table geoi.actions (
  id uuid primary key default gen_random_uuid(),
  detected_gap text,
  prompt_cluster_id uuid references geoi.prompt_clusters(id) on delete set null,
  evidence text,
  owner text,
  agent text,
  intervention text,
  approval_status text default 'pending',
  expected_lift numeric,
  actual_lift numeric,
  outcome text,
  baseline_period text,
  post_period text,
  created_at timestamptz default now()
);

create table geoi.reviews (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references geoi.answers(id) on delete cascade,
  reviewer text,
  decision text,         -- approve | reject | resolve | escalate
  comment text,
  created_at timestamptz default now()
);

create table geoi.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  claim text not null,
  approved_source text,
  approved_positioning text,
  version integer default 1,
  reviewed_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Computed metrics and job runs
-- ---------------------------------------------------------------------------

create table geoi.metrics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value numeric,
  period text,
  market text,
  engine text,
  computed_at timestamptz default now()
);

create table geoi.runs (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid,
  job text,
  status text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_prompts_cluster on geoi.prompts(cluster_id);
create index idx_answers_prompt on geoi.answers(prompt_id);
create index idx_answers_engine on geoi.answers(engine_id);
create index idx_answers_run on geoi.answers(run_batch_id);
create index idx_citations_answer on geoi.citations(answer_id);
create index idx_real_user_prompts_source on geoi.real_user_prompts(source);
create index idx_metrics_name on geoi.metrics(name);

-- ---------------------------------------------------------------------------
-- Row-level security
-- Enable on every table; policies are added once Supabase auth roles exist
-- (medical reviewer vs content operator see different rows).
-- ---------------------------------------------------------------------------

alter table geoi.prompt_clusters enable row level security;
alter table geoi.prompts enable row level security;
alter table geoi.real_user_prompts enable row level security;
alter table geoi.engines enable row level security;
alter table geoi.competitors enable row level security;
alter table geoi.sources enable row level security;
alter table geoi.answers enable row level security;
alter table geoi.citations enable row level security;
alter table geoi.actions enable row level security;
alter table geoi.reviews enable row level security;
alter table geoi.knowledge_base enable row level security;
alter table geoi.metrics enable row level security;
alter table geoi.runs enable row level security;
