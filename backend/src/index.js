// Minimal read API. The Next.js frontend can also read Supabase directly;
// these endpoints exist for a clean server-side read surface if needed.

import express from 'express';
import { supabase } from './lib/supabase.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`GEO I backend on :${port}`));
