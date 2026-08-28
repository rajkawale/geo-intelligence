-- GEO I — 002: expose the geoi schema to the API + grant access + seed demo data
-- Run this in the GEO I project SQL editor AFTER 001_init.sql.
--
-- Why this file exists: 001 created the geoi schema and tables, but did not
-- expose the schema to PostgREST (the REST API), so the client returns
-- PGRST106 "Invalid schema: geoi". This file fixes that, grants role access,
-- adds a demo read policy, and seeds the demo rows.
--
-- Product: Ozempic (semaglutide, Novo Nordisk) — type 2 diabetes.

-- ---------------------------------------------------------------------------
-- 1. Expose the geoi schema to the REST API
-- ---------------------------------------------------------------------------

alter role authenticator set pgrst.db_schemas = 'public, graphql_public, geoi';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 2. Grant schema + table access to the three Supabase roles
-- ---------------------------------------------------------------------------

grant usage on schema geoi to anon, authenticated, service_role;
-- The public `anon` (browser) key gets no table access. Reads go through the
-- authenticated role or the backend's service_role, never the public key.
grant select, insert, update, delete on all tables in schema geoi to authenticated, service_role;
alter default privileges in schema geoi grant select, insert, update, delete on tables to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Demo read policy (read-only for the browser role; service_role bypasses RLS)
--    Replace with real role-based policies (medical vs content) before production.
-- ---------------------------------------------------------------------------

create policy "demo read" on geoi.prompt_clusters    for select to authenticated using (true);
create policy "demo read" on geoi.prompts            for select to authenticated using (true);
create policy "demo read" on geoi.real_user_prompts  for select to authenticated using (true);
create policy "demo read" on geoi.engines            for select to authenticated using (true);
create policy "demo read" on geoi.competitors        for select to authenticated using (true);
create policy "demo read" on geoi.sources            for select to authenticated using (true);
create policy "demo read" on geoi.answers            for select to authenticated using (true);
create policy "demo read" on geoi.citations          for select to authenticated using (true);
create policy "demo read" on geoi.actions            for select to authenticated using (true);
create policy "demo read" on geoi.reviews            for select to authenticated using (true);
create policy "demo read" on geoi.knowledge_base     for select to authenticated using (true);
create policy "demo read" on geoi.metrics            for select to authenticated using (true);
create policy "demo read" on geoi.runs               for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 4. Seed demo data (mirrors frontend/lib/mockData.ts)
-- ---------------------------------------------------------------------------

insert into geoi.engines (name) values
  ('ChatGPT'), ('Perplexity'), ('Gemini'), ('AI Overviews');

insert into geoi.prompt_clusters (name, intent, priority) values
  ('Choosing a diabetes treatment', 'Deciding',  'high'),
  ('Comparing GLP-1 options',       'Comparing', 'medium'),
  ('Side effects and safety',       'Learning',  'low'),
  ('Weight loss with Ozempic',      'Deciding',  'high');

insert into geoi.competitors (name) values
  ('Mounjaro'), ('Trulicity'), ('Jardiance');

insert into geoi.sources (url, domain, source_type) values
  ('https://www.ncbi.nlm.nih.gov/guideline/diabetes', 'nih.gov',      'academic'),
  ('https://www.diabetes.org/standards',              'diabetes.org', 'third-party'),
  ('https://www.ozempic.com/pages/xyz',               'ozempic.com',  'owned'),
  ('https://www.mounjaro.com',                        'mounjaro.com', 'competitor');

insert into geoi.prompts (cluster_id, prompt_text, prompt_type, market) values
  ((select id from geoi.prompt_clusters where name = 'Choosing a diabetes treatment'), 'best GLP-1 for type 2 diabetes', 'unbranded', 'India'),
  ((select id from geoi.prompt_clusters where name = 'Weight loss with Ozempic'),       'weight loss with Ozempic',       'unbranded', 'India'),
  ((select id from geoi.prompt_clusters where name = 'Comparing GLP-1 options'),        'Ozempic vs Mounjaro cost',       'unbranded', 'India');

insert into geoi.real_user_prompts (prompt_text, volume, cluster_ref, intent, market) values
  ('best GLP-1 for type 2 diabetes', 412, 'Choosing a diabetes treatment', 'Deciding',  'India'),
  ('weight loss with Ozempic',       208, 'Weight loss with Ozempic',      'Deciding',  'India'),
  ('Ozempic vs Mounjaro cost',        96, 'Comparing GLP-1 options',       'Comparing', 'India');

-- Representative answers (one row per tracked prompt per engine)
insert into geoi.answers (prompt_id, engine_id, recommendation, position, mention_type) values
  ((select id from geoi.prompts where prompt_text = 'best GLP-1 for type 2 diabetes'),
   (select id from geoi.engines where name = 'Gemini'),   false, 4,    'lower'),
  ((select id from geoi.prompts where prompt_text = 'weight loss with Ozempic'),
   (select id from geoi.engines where name = 'ChatGPT'),  false, null, 'absent'),
  ((select id from geoi.prompts where prompt_text = 'Ozempic vs Mounjaro cost'),
   (select id from geoi.engines where name = 'Perplexity'), true, 1,    'position_1');

-- Representative citations
insert into geoi.citations (answer_id, source_id, claim, support_status) values
  ((select id from geoi.answers order by run_at desc limit 1),
   (select id from geoi.sources where domain = 'nih.gov'),       'Lowers A1C in adults with type 2 diabetes', 'valid'),
  ((select id from geoi.answers order by run_at desc limit 1),
   (select id from geoi.sources where domain = 'diabetes.org'), 'More effective than Mounjaro',              'partial');

insert into geoi.actions (detected_gap, evidence, owner, agent, intervention, approval_status, expected_lift) values
  ('Choosing a diabetes treatment', '48 questions · Mounjaro recommended more', 'Content', 'Content Authority', 'Publish an Ozempic vs Mounjaro comparison page', 'pending',  6),
  ('Wrong positioning',             '3 answers are wrong',                      'Brand',   'Claims & Risk',     'Fix positioning on the label page',              'approved', 4);

insert into geoi.knowledge_base (claim, approved_source, approved_positioning) values
  ('Lowers A1C in adults with type 2 diabetes', 'ozempic.com/label', 'on-label'),
  ('More effective than Mounjaro',              'diabetes.org',      'under review');

insert into geoi.metrics (name, value, period, market) values
  ('appears_in_ai_answers',   47.9, 'last_30d', 'India'),
  ('cited_by_ai',             18.0, 'last_30d', 'India'),
  ('recommended_by_ai',       16.0, 'last_30d', 'India'),
  ('facts_right',             91.0, 'last_30d', 'India'),
  ('ai_clicks_that_convert',   3.8, 'last_30d', 'India');
