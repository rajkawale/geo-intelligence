// Job: pull real-user prompts from Profound into geoi.real_user_prompts.
// Run on a schedule (Railway cron). One run fetches the latest and inserts.

import { supabase } from '../lib/supabase.js';
import { fetchRealUserPrompts } from '../lib/profound.js';

async function main() {
  const market = process.env.GEOI_MARKET || undefined;
  const categoryId = process.env.PROFOUND_CATEGORY_ID;

  // Last 30 days.
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const prompts = await fetchRealUserPrompts({
    categoryId,
    startDate: fmt(start),
    endDate: fmt(end),
    market,
  });

  if (!prompts.length) {
    console.log('Profound returned no prompts');
    return;
  }

  const { error } = await supabase.from('real_user_prompts').insert(prompts);
  if (error) throw error;
  console.log(`Inserted ${prompts.length} real-user prompts`);
}

main().catch((e) => {
  console.error('fetch-profound failed:', e.message);
  process.exit(1);
});
