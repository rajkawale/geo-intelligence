// Gemini client. Two uses, per 07_product_spec v3/v4: internal insight
// curation only (narration below) — Profound already covers multi-engine
// answer generation, so generateStructuredAnswer stays for prompts Profound
// doesn't cover, not as the primary measurement pipeline.

async function callGemini(instruction) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini call failed: ${res.status}`);

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function generateStructuredAnswer({ promptText, brand, competitors }) {
  const instruction = [
    'Answer the user prompt the way an AI search assistant naturally would.',
    'Then analyze your own answer and return JSON only (no markdown fences).',
    '',
    `Brand under measurement: ${brand}`,
    `Competitors: ${competitors.join(', ')}`,
    '',
    'Return this exact shape:',
    '{',
    '  "answer": "<your answer text>",',
    '  "visibility": "present" | "absent",',
    '  "mention_type": "position_1" | "top_3" | "lower" | "mention_only" | "absent",',
    '  "recommendation": true | false,',
    '  "position": <integer or null>,',
    '  "citations": [{ "url": "...", "domain": "...", "claim": "..." }]',
    '}',
    '',
    `User prompt: ${promptText}`,
  ].join('\n');

  const text = await callGemini(instruction);
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Gemini returned no JSON block');
  return JSON.parse(text.slice(start, end + 1));
}

// Internal insight curation ("Ask I") — turns a content-gap summary into a
// short, specific sentence a GEO strategist can act on. Not a measurement
// call: the numbers it narrates already came from Profound.
export async function generateNarration({ brand, summary }) {
  const instruction = [
    'You are GEO Intelligence\'s internal insight assistant for a pharma GEO team.',
    'Write 2-3 short, specific sentences (no preamble, no markdown) narrating',
    'what this content-gap data means and what to do about it. Name the',
    'engine, the competitor, and the funnel stage where relevant. Do not',
    'invent numbers not present in the summary. Plain, direct, no hedging.',
    '',
    `Brand: ${brand}`,
    `Data: ${JSON.stringify(summary)}`,
  ].join('\n');

  return (await callGemini(instruction)).trim();
}
