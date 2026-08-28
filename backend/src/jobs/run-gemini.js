// Job: run tracked prompts through Gemini and store answers + citations.
// This is the "measure" step. Run on a schedule, after fetch-profound.

import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabase.js';
import { generateStructuredAnswer } from '../lib/gemini.js';

const BRAND = process.env.GEOI_BRAND || 'Product X';
const COMPETITORS = (process.env.GEOI_COMPETITORS || 'Otezla,Sotyktu,Skyrizi')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  // Ensure the Gemini engine exists.
  let { data: engine } = await supabase.from('engines').select('id').eq('name', 'Gemini').single();
  if (!engine) {
    const { data, error } = await supabase.from('engines').insert({ name: 'Gemini' }).select('id').single();
    if (error) throw error;
    engine = data;
  }

  // Active tracked prompts.
  const { data: prompts, error } = await supabase.from('prompts').select('id, prompt_text').eq('active', true);
  if (error) throw error;

  const batchId = randomUUID();
  let done = 0;

  for (const prompt of prompts) {
    try {
      const r = await generateStructuredAnswer({
        promptText: prompt.prompt_text,
        brand: BRAND,
        competitors: COMPETITORS,
      });

      const { data: answer, error: aErr } = await supabase
        .from('answers')
        .insert({
          prompt_id: prompt.id,
          engine_id: engine.id,
          model_version: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
          answer_text: r.answer,
          visibility: r.visibility,
          mention_type: r.mention_type,
          recommendation: r.recommendation,
          position: r.position,
          run_batch_id: batchId,
        })
        .select('id')
        .single();
      if (aErr) throw aErr;

      for (const c of r.citations ?? []) {
        let domain = c.domain;
        try { domain = domain || new URL(c.url).hostname; } catch { /* keep as-is */ }
        await supabase.from('sources').upsert({ url: c.url, domain }, { onConflict: 'url' });
        await supabase.from('citations').insert({
          answer_id: answer.id,
          claim: c.claim,
          support_status: 'requires_review',
        });
      }
      done += 1;
    } catch (e) {
      console.error(`prompt ${prompt.id} failed: ${e.message}`);
    }
  }

  console.log(`Ran Gemini on ${done}/${prompts.length} prompts (batch ${batchId})`);
}

main().catch((e) => {
  console.error('run-gemini failed:', e.message);
  process.exit(1);
});
