// Minimal read API. The Next.js frontend can also read Supabase directly;
// these endpoints exist for a clean server-side read surface if needed.

import express from 'express';
import { supabase } from './lib/supabase.js';
import { generateNarration, generateSuggestion } from './lib/gemini.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

// The frontend (Next.js, a different port in dev) calls this API from the
// browser — allow it. Tighten to a specific origin before deploying.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Shared-secret gate for the data endpoints. Replace with Supabase JWT + role
// checks before production. If GEOI_API_KEY is unset, endpoints stay open for
// local dev only — never deploy with it unset.
const API_KEY = process.env.GEOI_API_KEY;
function requireKey(req, res, next) {
  if (API_KEY && req.get('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Which brands actually keep getting new data vs. a one-time historical pull
// that's now frozen. Ozempic and CagriSema were pulled once before scope
// narrowed to one brand at a time (see fetch-profound.js) — GEOI_ACTIVE_BRANDS
// is the real source of truth for which ones keep refreshing, so read it
// instead of hardcoding a duplicate list here that could drift.
app.get('/api/config', requireKey, (_req, res) => {
  const activeBrands = (process.env.GEOI_ACTIVE_BRANDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  res.json({ activeBrands });
});

app.get('/api/metrics', requireKey, async (_req, res) => {
  const { data, error } = await supabase.from('metrics').select('*').order('computed_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/answers', requireKey, async (_req, res) => {
  const { data, error } = await supabase.from('answers').select('*').order('run_at', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/real-user-prompts', requireKey, async (_req, res) => {
  const { data, error } = await supabase.from('real_user_prompts').select('*').order('fetched_at', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Phase 1 — real query explorer. Filters: brand, gap_status, persona,
// branded ('branded' | 'unbranded', matched against Profound's own tags),
// q (substring search on the prompt text). Paginated with limit/offset.
app.get('/api/profound-runs', requireKey, async (req, res) => {
  const { brand, gap_status, persona, branded, q, limit = '50', offset = '0' } = req.query;

  let query = supabase
    .from('profound_runs')
    .select('*', { count: 'exact' })
    .order('run_date', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (brand) query = query.eq('brand', brand);
  if (gap_status) query = query.eq('gap_status', gap_status);
  if (persona) query = query.eq('persona', persona);
  if (branded === 'branded' || branded === 'unbranded') query = query.contains('tags', [branded === 'branded' ? 'Branded' : 'Unbranded']);
  if (q) query = query.ilike('prompt_text', `%${q}%`);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ rows: data, total: count });
});

// Content-gap summary — counts per brand x gap_status, the number behind the
// roadmap's "content-gap diagnosis, not a metric dump" promise.
//
// This used to do `.select('brand, gap_status')` with no range and no order,
// which PostgREST silently caps at 1000 rows *total, arbitrarily ordered* —
// at 45,289 real Wegovy rows that was counting well under 2% of the data,
// and a different arbitrary 2% on every call (one call showed Wegovy at 986
// rows, the next at 12). Caught by actually loading the dashboard and
// noticing the number didn't match what fetch-profound.js had logged.
// Fixed with exact count-only queries — the true total, not a sample of it.
const KNOWN_BRANDS = ['Wegovy', 'Ozempic', 'CagriSema'];
const GAP_STATUSES = ['won', 'contested', 'lost', 'absent'];

app.get('/api/profound-runs/summary', requireKey, async (_req, res) => {
  try {
    // All brand x status counts fired at once — was a fully sequential double
    // loop (12 round trips, one waiting on the last for no reason since none
    // of these queries depend on each other).
    const jobs = KNOWN_BRANDS.flatMap((brand) =>
      GAP_STATUSES.map(async (status) => {
        const { count, error } = await supabase
          .from('profound_runs')
          .select('id', { count: 'exact', head: true })
          .eq('brand', brand)
          .eq('gap_status', status);
        if (error) throw error;
        return { brand, status, count: count ?? 0 };
      })
    );
    const results = await Promise.all(jobs);
    const summary = {};
    for (const { brand, status, count } of results) {
      const counts = (summary[brand] ??= { won: 0, contested: 0, lost: 0, absent: 0, total: 0 });
      counts[status] = count;
      counts.total += count;
    }
    for (const brand of Object.keys(summary)) {
      if (summary[brand].total === 0) delete summary[brand];
    }
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// When was this brand's data actually pulled — the dashboard used to show
// real counts with no way to tell if they were from today or three weeks
// ago. A single row, ordered + limited to 1, so this doesn't hit the
// unbounded-select cap that broke /summary.
app.get('/api/profound-runs/freshness', requireKey, async (req, res) => {
  const { brand } = req.query;
  if (!brand) return res.status(400).json({ error: 'brand is required' });
  try {
    const { data, error } = await supabase
      .from('profound_runs')
      .select('fetched_at')
      .eq('brand', brand)
      .order('fetched_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    res.json({ lastFetchedAt: data?.[0]?.fetched_at ?? null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Per-engine breakdown — replaces the old "Which AI assistant recommends you"
// heatmap, which was hardcoded numbers for 4 engines that were never wired to
// anything. This is the real thing: visibility rate per engine, from the
// same count-only pattern as /summary (a raw .select() here would hit the
// same 1000-row cap that broke /summary — see the comment above it).
// The 8 engines Profound covers, confirmed from a live response's info.models
// (see 07_product_spec). Hardcoded rather than discovered from a sampled
// .select() — a sample can miss an engine name entirely, same failure shape
// as the /summary bug above.
const KNOWN_ENGINES = [
  'ChatGPT', 'Google Gemini', 'Meta AI', 'Grok',
  'Google AI Mode', 'Perplexity', 'Google AI Overviews', 'Microsoft Copilot',
];

app.get('/api/profound-runs/by-engine', requireKey, async (req, res) => {
  const { brand } = req.query;
  if (!brand) return res.status(400).json({ error: 'brand is required' });
  try {
    // 8 engines x 4 statuses fired at once — was 32 fully sequential round
    // trips, the slowest part of loading this brand's Visibility tab.
    const jobs = KNOWN_ENGINES.flatMap((engine) =>
      GAP_STATUSES.map(async (status) => {
        const { count, error } = await supabase
          .from('profound_runs')
          .select('id', { count: 'exact', head: true })
          .eq('brand', brand)
          .eq('engine_name', engine)
          .eq('gap_status', status);
        if (error) throw error;
        return { engine, status, count: count ?? 0 };
      })
    );
    const results = await Promise.all(jobs);
    const byEngine = {};
    for (const { engine, status, count } of results) {
      const counts = (byEngine[engine] ??= { won: 0, contested: 0, lost: 0, absent: 0, total: 0 });
      counts[status] = count;
      counts.total += count;
    }
    for (const engine of Object.keys(byEngine)) {
      if (byEngine[engine].total === 0) delete byEngine[engine];
    }
    res.json(byEngine);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Competitor rollup — the "Competitive landscape" tab used to say "not built,
// but the signal is real, just filter /queries to Lost and read the Mentions
// column." This does that filtering for you. Exact-string .contains() match
// per known competitor name, same list fetch-profound.js uses to compute
// competitor_mentioned — NOT the same substring rule (that job does
// case-insensitive .includes(), this does exact array-element match), so a
// mention like "Mounjaro (tirzepatide)" would be missed here but still counted
// in the brand's overall Lost/Contested totals above. Undercounts, never
// overcounts — labelled as such in the UI.
const KNOWN_COMPETITORS = [
  'Mounjaro', 'Zepbound', 'Trulicity', 'Jardiance', 'Farxiga',
  'Victoza', 'Saxenda', 'Bydureon', 'Adlyxin',
];

app.get('/api/profound-runs/competitors', requireKey, async (req, res) => {
  const { brand } = req.query;
  if (!brand) return res.status(400).json({ error: 'brand is required' });
  try {
    // All 9 competitors x 2 counts fired at once instead of one competitor at
    // a time — the sequential version took 9-10s per brand in testing (each
    // competitor waited on the previous one's round trip for no reason, since
    // none of these 18 queries depend on each other).
    const results = await Promise.all(
      KNOWN_COMPETITORS.map(async (name) => {
        // supabase-js's .contains() mis-encodes a jsonb array containment filter
        // (sends a Postgres array literal, PostgREST wants JSON) and fails with
        // "invalid input syntax for type json" — .filter(col, 'cs', json) sends
        // the same "cs." operator with the JSON encoding PostgREST actually needs.
        const [lostRes, contestedRes] = await Promise.all([
          supabase.from('profound_runs').select('id', { count: 'exact', head: true })
            .eq('brand', brand).eq('gap_status', 'lost').filter('mentions', 'cs', JSON.stringify([name])),
          supabase.from('profound_runs').select('id', { count: 'exact', head: true })
            .eq('brand', brand).eq('gap_status', 'contested').filter('mentions', 'cs', JSON.stringify([name])),
        ]);
        if (lostRes.error) throw lostRes.error;
        if (contestedRes.error) throw contestedRes.error;
        const lost = lostRes.count ?? 0;
        const contested = contestedRes.count ?? 0;
        return { competitor: name, lost, contested, total: lost + contested };
      })
    );
    const rows = results.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
    res.json({ rows, note: 'Exact-name match — undercounts rows where the mention includes extra text (e.g. "Mounjaro (tirzepatide)"). Never overcounts.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ask I — internal insight narration only (Gemini), over data already
// measured by Profound. Not a second measurement pipeline.
app.post('/api/insight-narration', requireKey, async (req, res) => {
  const { brand, summary } = req.body || {};
  if (!brand || !summary) return res.status(400).json({ error: 'brand and summary are required' });
  try {
    const narration = await generateNarration({ brand, summary });
    res.json({ narration });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// "Suggested focus" on Overview — same Gemini insight-curation lane as Ask I,
// given a richer real-data bundle (gap summary + per-engine breakdown + top
// competitors) so the suggestion can point at a specific engine/competitor
// instead of just repeating the totals. Still not a measurement pipeline —
// Gemini only reads numbers Profound and the rollups above already produced.
app.post('/api/insight-suggestion', requireKey, async (req, res) => {
  const { brand, summary, engines, competitors } = req.body || {};
  if (!brand || !summary) return res.status(400).json({ error: 'brand and summary are required' });
  try {
    const suggestion = await generateSuggestion({ brand, summary, engines, competitors });
    res.json({ suggestion });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`GEO I backend on :${port}`));
