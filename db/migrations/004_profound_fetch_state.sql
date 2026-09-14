-- GEO I — 004: resumable Profound fetch state
-- Run this in the GEO I project SQL editor AFTER 001, 002, 003.
--
-- Why this file exists: fetch-profound.js used to hold every row for a brand
-- in memory and upsert once at the end of the run. That's fine for a 200-row
-- test pull; it does not survive a full-volume backfill (Wegovy alone is
-- ~193,748 rows / ~969 pages / ~74 minutes at Profound's max page size).
-- A single failed request partway through used to lose the whole run's
-- progress. This table lets fetch-profound.js checkpoint per brand — upsert
-- as it goes, and resume from the last cursor on the next run instead of
-- starting over.

create table if not exists geoi.profound_fetch_state (
  brand text primary key,
  category_id text not null,
  window_start date not null,
  window_end date not null,
  cursor text,                            -- Profound's next_cursor; null = not started or window complete
  status text not null default 'in_progress',  -- in_progress | complete
  pages_fetched integer not null default 0,
  rows_fetched integer not null default 0,
  last_error text,
  updated_at timestamptz default now()
);

alter table geoi.profound_fetch_state enable row level security;

create policy "demo read" on geoi.profound_fetch_state for select to authenticated using (true);

grant select, insert, update, delete on geoi.profound_fetch_state to authenticated, service_role;

notify pgrst, 'reload schema';
