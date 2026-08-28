// Job: compute KPIs from the latest answer batch into geoi.metrics.
// Run after run-gemini.

import { supabase } from '../lib/supabase.js';

async function main() {
  const { data: latest } = await supabase
    .from('answers')
    .select('run_batch_id')
    .order('run_at', { ascending: false })
    .limit(1)
    .single();

  if (!latest?.run_batch_id) {
    console.log('No answer runs yet');
    return;
  }

  const batchId = latest.run_batch_id;
  const { data: answers, error } = await supabase
    .from('answers')
    .select('visibility, recommendation')
    .eq('run_batch_id', batchId);
  if (error) throw error;

  const total = answers.length;
  if (!total) return;

  const present = answers.filter((a) => a.visibility === 'present').length;
  const recommended = answers.filter((a) => a.recommendation).length;
  const visibilityRate = (present / total) * 100;
  const recommendationRate = (recommended / total) * 100;
  const period = new Date().toISOString().slice(0, 10);

  await supabase.from('metrics').insert([
    { name: 'visibility_rate', value: visibilityRate, period },
    { name: 'recommendation_rate', value: recommendationRate, period },
  ]);

  console.log(
    `batch ${batchId.slice(0, 8)}: visibility ${visibilityRate.toFixed(1)}%, recommendation ${recommendationRate.toFixed(1)}% (n=${total})`
  );
}

main().catch((e) => {
  console.error('compute-metrics failed:', e.message);
  process.exit(1);
});
