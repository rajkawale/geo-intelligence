// Gemini client — answer generation on tracked prompts.
// The model is held as an env var and never surfaced in the UI.

export async function generateStructuredAnswer({ promptText, brand, competitors }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini call failed: ${res.status}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Gemini returned no JSON block');
  return JSON.parse(text.slice(start, end + 1));
}
