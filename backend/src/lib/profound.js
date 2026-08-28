// Profound client — real-user prompt data.
// Auth + endpoint from https://docs.tryprofound.com/rest-api/introduction
//   Base: https://api.tryprofound.com · Auth: X-API-Key header
//   POST /v2/prompts/answers · body: { category_id (UUID), start_date, end_date }
// Response field names are best-effort until a real call confirms them.

const BASE = 'https://api.tryprofound.com';

export async function fetchRealUserPrompts({ categoryId, startDate, endDate, market } = {}) {
  const key = process.env.PROFOUND_API_KEY;
  if (!key) throw new Error('PROFOUND_API_KEY is not set');
  if (!categoryId) throw new Error('PROFOUND_CATEGORY_ID is not set');
  if (!startDate || !endDate) throw new Error('start_date and end_date are required');

  const res = await fetch(`${BASE}/v2/prompts/answers`, {
    method: 'POST',
    headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ category_id: categoryId, start_date: startDate, end_date: endDate }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Profound fetch failed: ${res.status} ${JSON.stringify(err).slice(0, 300)}`);
  }

  const data = await res.json();
  const rows = Array.isArray(data) ? data : data.prompts ?? data.results ?? data.answers ?? [];

  return rows.map((p) => ({
    prompt_text: p.text ?? p.prompt ?? p.query ?? p.search_query ?? '',
    volume: p.volume ?? p.count ?? p.occurrences ?? null,
    cluster_ref: p.cluster ?? p.category ?? null,
    intent: p.intent ?? null,
    market: p.market ?? market ?? null,
  }));
}
