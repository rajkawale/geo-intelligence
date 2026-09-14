// Job: pull real-user Profound runs for every live NN brand into
// geoi.profound_runs, and compute the content-gap diagnosis per run.
// Phase 1 scope (07_product_spec/GEO_I_product_spec_v4.md): a real,
// bounded pull — not the full 30-day firehose (193,748 for Wegovy alone).
// Run on a schedule (Railway cron) once this proves out.

import { supabase } from '../lib/supabase.js';
import { fetchRealUserRuns } from '../lib/profound.js';

// Novo Nordisk's own brands never count as a "competitor" mention, even
// though they often appear together in the same AI answer (e.g. Rybelsus
// alongside Wegovy in an oral-GLP-1 comparison).
const NN_OWN_BRANDS = ['wegovy', 'ozempic', 'cagrisema', 'rybelsus'];

// The real competitive set observed live in Profound's own Wegovy sample
// (see product_spec v2/v3 evidence) plus the standard GLP-1/diabetes field.
const COMPETITOR_NAMES = [
  'mounjaro', 'zepbound', 'trulicity', 'jardiance', 'farxiga',
  'victoza', 'saxenda', 'bydureon', 'adlyxin',
];

const BRANDS = [
  { brand: 'Wegovy', categoryId: '2b524b65-4c96-4f71-a257-f3ebc92eb228', aliases: ['wegovy'] },
  { brand: 'Ozempic', categoryId: 'b8b0354d-ad16-4b2e-9c84-40b01fd89de7', aliases: ['ozempic'] },
  { brand: 'CagriSema', categoryId: '6b76ae30-105a-4b9d-8b70-8c981aac088c', aliases: ['cagrisema'] },
];

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

async function main() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Number(process.env.PROFOUND_FETCH_WINDOW_DAYS || 7));
  const fmt = (d) => d.toISOString().slice(0, 10);
  const maxPages = Number(process.env.PROFOUND_MAX_PAGES || 20);

  let totalUpserted = 0;

  for (const { brand, categoryId, aliases } of BRANDS) {
    const { rows, totalResults, pagesFetched } = await fetchRealUserRuns({
      categoryId,
      startDate: fmt(start),
      endDate: fmt(end),
      maxPages,
    });

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

    if (withGap.length) {
      const { error } = await supabase
        .from('profound_runs')
        .upsert(withGap, { onConflict: 'profound_run_id' });
      if (error) throw new Error(`upsert failed for ${brand}: ${error.message}`);
    }

    totalUpserted += withGap.length;
    console.log(
      `${brand}: fetched ${rows.length} runs (${pagesFetched} pages) of ${totalResults} available in the window, ` +
      `${withGap.filter((r) => r.gap_status === 'lost').length} lost, ` +
      `${withGap.filter((r) => r.gap_status === 'contested').length} contested, ` +
      `${withGap.filter((r) => r.gap_status === 'won').length} won, ` +
      `${withGap.filter((r) => r.gap_status === 'absent').length} absent`
    );
  }

  console.log(`Done. ${totalUpserted} runs upserted into geoi.profound_runs.`);
}

main().catch((e) => {
  console.error('fetch-profound failed:', e.message);
  process.exit(1);
});
