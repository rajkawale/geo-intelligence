// Job: pull real-user Profound runs for every live NN brand into
// geoi.profound_runs, and compute the content-gap diagnosis per run.
//
// Resumable, checkpointed (geoi.profound_fetch_state), and batches its
// upserts page-by-page — none of this holds a whole brand's data in memory
// or waits until the end to save. A run that fails partway (network, a
// Profound rate limit, the process getting killed) leaves everything fetched
// so far in the database and the next run picks up from the saved cursor,
// not page 1. See 07_product_spec and this session's "will our architecture
// survive full volume" answer for why: Wegovy alone is ~969 pages at
// Profound's 200-row page ceiling, ~74 minutes sequential — too long, and
// too much to risk losing, to do in one unchecked shot.
//
// Run on a schedule (Railway cron). Each run does up to
// PROFOUND_MAX_PAGES_PER_RUN pages per brand, then stops and saves the
// cursor — run it again (or schedule it) to keep making progress on a
// brand's backfill until its window is marked 'complete'.

import { supabase } from '../lib/supabase.js';
import { fetchRealUserRuns } from '../lib/profound.js';

// Novo Nordisk's own brands (Wegovy, Ozempic, CagriSema, Rybelsus) never
// count as a "competitor" mention, even though they often appear together in
// the same AI answer (e.g. Rybelsus alongside Wegovy in an oral-GLP-1
// comparison) — they're just not in this list.
const COMPETITOR_NAMES = [
  'mounjaro', 'zepbound', 'trulicity', 'jardiance', 'farxiga',
  'victoza', 'saxenda', 'bydureon', 'adlyxin',
];

// The full brand catalog GEO I knows about. Brand strategy work happens one
// brand at a time, not all three at once (Raj's call) — GEOI_ACTIVE_BRANDS
// controls which of these a given run actually pulls. Default: Wegovy only.
const ALL_BRANDS = [
  { brand: 'Wegovy', categoryId: '2b524b65-4c96-4f71-a257-f3ebc92eb228', aliases: ['wegovy'] },
  { brand: 'Ozempic', categoryId: 'b8b0354d-ad16-4b2e-9c84-40b01fd89de7', aliases: ['ozempic'] },
  { brand: 'CagriSema', categoryId: '6b76ae30-105a-4b9d-8b70-8c981aac088c', aliases: ['cagrisema'] },
];

const activeBrandNames = (process.env.GEOI_ACTIVE_BRANDS || 'Wegovy')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const BRANDS = ALL_BRANDS.filter((b) => activeBrandNames.includes(b.brand));

function includesAny(mentions, needles) {
  return mentions.some((m) => {
    const lower = String(m).toLowerCase();
    return needles.some((n) => lower.includes(n));
  });
}

function diagnoseGap({ mentions, brandAliases }) {
  const brandMentioned = includesAny(mentions, brandAliases);
  const competitorMentioned = includesAny(mentions, COMPETITOR_NAMES);
  let gapStatus;
  if (brandMentioned && competitorMentioned) gapStatus = 'contested';
  else if (brandMentioned) gapStatus = 'won';
  else if (competitorMentioned) gapStatus = 'lost';
  else gapStatus = 'absent';
  return { brandMentioned, competitorMentioned, gapStatus };
}

async function loadOrInitState({ brand, categoryId, windowStart, windowEnd }) {
  const { data: existing, error } = await supabase
    .from('profound_fetch_state')
    .select('*')
    .eq('brand', brand)
    .maybeSingle();
  if (error) throw new Error(`load state failed for ${brand}: ${error.message}`);

  // Same window as before and still in progress -> resume from its cursor.
  if (existing && existing.window_start === windowStart && existing.window_end === windowEnd) {
    return existing;
  }

  // New window (or first run for this brand) -> start fresh.
  const fresh = {
    brand,
    category_id: categoryId,
    window_start: windowStart,
    window_end: windowEnd,
    cursor: null,
    status: 'in_progress',
    pages_fetched: 0,
    rows_fetched: 0,
    last_error: null,
  };
  const { data, error: upsertErr } = await supabase
    .from('profound_fetch_state')
    .upsert(fresh, { onConflict: 'brand' })
    .select('*')
    .single();
  if (upsertErr) throw new Error(`init state failed for ${brand}: ${upsertErr.message}`);
  return data;
}

async function saveState(state) {
  const { error } = await supabase
    .from('profound_fetch_state')
    .update({ ...state, updated_at: new Date().toISOString() })
    .eq('brand', state.brand);
  if (error) throw new Error(`save state failed for ${state.brand}: ${error.message}`);
}

async function upsertRows({ rows, brand, categoryId, aliases }) {
  const withGap = rows.map((r) => {
    const { brandMentioned, competitorMentioned, gapStatus } = diagnoseGap({
      mentions: r.mentions,
      brandAliases: aliases,
    });
    return {
      ...r,
      brand,
      category_id: categoryId,
      brand_mentioned: brandMentioned,
      competitor_mentioned: competitorMentioned,
      gap_status: gapStatus,
    };
  });
  const { error } = await supabase.from('profound_runs').upsert(withGap, { onConflict: 'profound_run_id' });
  if (error) throw new Error(`upsert failed: ${error.message}`);
  return withGap;
}

async function main() {
  if (!BRANDS.length) {
    throw new Error(`GEOI_ACTIVE_BRANDS matched none of: ${ALL_BRANDS.map((b) => b.brand).join(', ')}`);
  }
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Number(process.env.PROFOUND_FETCH_WINDOW_DAYS || 7));
  const fmt = (d) => d.toISOString().slice(0, 10);
  const windowStart = fmt(start);
  const windowEnd = fmt(end);
  const maxPagesPerRun = Number(process.env.PROFOUND_MAX_PAGES_PER_RUN || 20);

  for (const { brand, categoryId, aliases } of BRANDS) {
    const state = await loadOrInitState({ brand, categoryId, windowStart, windowEnd });

    if (state.status === 'complete') {
      console.log(`${brand}: window ${windowStart}..${windowEnd} already complete (${state.rows_fetched} rows). Skipping.`);
      continue;
    }

    const gapCounts = { won: 0, contested: 0, lost: 0, absent: 0 };
    let pagesThisRun = 0;
    let rowsThisRun = 0;

    try {
      const { nextCursor, totalResults, pagesFetched } = await fetchRealUserRuns({
        categoryId,
        startDate: windowStart,
        endDate: windowEnd,
        startCursor: state.cursor,
        maxPages: maxPagesPerRun,
        onPage: async (rows) => {
          const withGap = await upsertRows({ rows, brand, categoryId, aliases });
          for (const r of withGap) gapCounts[r.gap_status] += 1;
          pagesThisRun += 1;
          rowsThisRun += rows.length;
        },
      });

      const newState = {
        brand,
        category_id: categoryId,
        window_start: windowStart,
        window_end: windowEnd,
        cursor: nextCursor,
        status: nextCursor ? 'in_progress' : 'complete',
        pages_fetched: state.pages_fetched + pagesFetched,
        rows_fetched: state.rows_fetched + rowsThisRun,
        last_error: null,
      };
      await saveState(newState);

      const pctOfTotal = totalResults ? ((newState.rows_fetched / totalResults) * 100).toFixed(1) : '?';
      console.log(
        `${brand}: +${rowsThisRun} rows this run (${pagesThisRun} pages) — ` +
        `${newState.rows_fetched}/${totalResults ?? '?'} total (${pctOfTotal}%), status=${newState.status}. ` +
        `This run: ${gapCounts.won} won, ${gapCounts.contested} contested, ${gapCounts.lost} lost, ${gapCounts.absent} absent.`
      );
    } catch (e) {
      await saveState({ ...state, last_error: e.message });
      console.error(`${brand} failed after ${pagesThisRun} pages this run (progress up to that point is saved): ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error('fetch-profound failed:', e.message);
  process.exit(1);
});
