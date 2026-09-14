// Minimal read API. The Next.js frontend can also read Supabase directly;
// these endpoints exist for a clean server-side read surface if needed.

import express from 'express';
import { supabase } from './lib/supabase.js';
import { generateNarration } from './lib/gemini.js';
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
app.get('/api/profound-runs/summary', requireKey, async (_req, res) => {
  const { data, error } = await supabase.from('profound_runs').select('brand, gap_status');
  if (error) return res.status(500).json({ error: error.message });

  const summary = {};
  for (const row of data) {
    summary[row.brand] ??= { won: 0, contested: 0, lost: 0, absent: 0, total: 0 };
    summary[row.brand][row.gap_status] += 1;
    summary[row.brand].total += 1;
  }
  res.json(summary);
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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`GEO I backend on :${port}`));
