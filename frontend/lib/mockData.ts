// Mock data for the GEO I demo. Mirrors the seed SQL, so the dashboard works
// before the Supabase project is wired. Replace with live reads when ready.
//
// Product: Ozempic (semaglutide, Novo Nordisk) — type 2 diabetes.

export type Source = { key: string; name: string; type: 'Third-party' | 'Internal' | 'API' };

export const SOURCES: Record<string, Source> = {
  profound: { key: 'profound', name: 'Profound', type: 'Third-party' },
  ahrefs: { key: 'ahrefs', name: 'Ahrefs', type: 'Third-party' },
  bing: { key: 'bing', name: 'Bing Webmaster Tools', type: 'Third-party' },
  gemini: { key: 'gemini', name: 'Gemini API', type: 'API' },
  cms: { key: 'cms', name: 'Your content system', type: 'Internal' },
  kb: { key: 'kb', name: 'Your approved facts', type: 'Internal' },
  crm: { key: 'crm', name: 'Your CRM', type: 'Internal' },
};

export const kpis = [
  { label: 'Appears in AI answers', value: '47.9%', delta: '+2.0 points', up: true, source: 'ahrefs' },
  { label: 'Cited by AI', value: '18.0%', delta: '-2.1 points', up: false, source: 'bing' },
  { label: 'Recommended by AI', value: '16.0%', delta: '+2.8 points', up: true, source: 'gemini' },
];

export const health = {
  score: 68,
  label: 'Needs attention',
  components: [
    { name: 'Showing up', weight: 40, score: 62 },
    { name: 'Cited', weight: 30, score: 55 },
    { name: 'Recommended', weight: 30, score: 48 },
  ],
};

export const drivers = [
  { label: 'More citations', detail: '+3 sources', note: 'nih.gov and diabetes.org began citing your pages', up: true },
  { label: 'Competitor moved', detail: 'Trulicity -2 points', note: 'on diabetes treatment questions', up: false },
  { label: 'New topic', detail: '+1 topic', note: 'weight-loss discussion entered the top questions', up: true },
  { label: 'Platform change', detail: 'AI Overviews refresh', note: 'a note, not a proven cause', up: false },
];

export const brandedUnbranded = [
  { label: 'Brand-name questions', value: '63.4%', source: 'ahrefs' },
  { label: 'Generic questions', value: '21.8%', source: 'profound' },
];

export const largestOpportunity = {
  title: "You're behind on diabetes treatment-choice questions — India",
  priority: 'High',
  inputs: [
    { label: 'Questions affected', value: '48', note: 'people deciding on a diabetes treatment' },
    { label: 'How far behind', value: '-19 points', note: 'Mounjaro is recommended more' },
    { label: 'Market priority', value: 'High', note: 'priority market · active launch' },
  ],
};

export const clusters = [
  { name: 'Choosing a diabetes treatment', intent: 'Deciding', visibility: 42, recommendation: 18, position: 'Top 3', leader: 'Mounjaro', gap: -19, priority: 'High' },
  { name: 'Comparing GLP-1 options', intent: 'Comparing', visibility: 55, recommendation: 27, position: 'First', leader: 'Trulicity', gap: -8, priority: 'Med' },
  { name: 'Side effects and safety', intent: 'Learning', visibility: 61, recommendation: 34, position: 'First', leader: '—', gap: 2, priority: 'Low' },
  { name: 'Weight loss with Ozempic', intent: 'Deciding', visibility: 19, recommendation: 6, position: 'Not mentioned', leader: 'Several', gap: -22, priority: 'High' },
];

export const heatmap = {
  engines: ['ChatGPT', 'Perplexity', 'Gemini', 'AI Overviews'],
  rows: [
    { cluster: 'Treatment', rec: [6, 12, 8, 5] },
    { cluster: 'Efficacy', rec: [28, 24, 30, 19] },
    { cluster: 'Safety', rec: [41, 38, 36, 29] },
    { cluster: 'Weight loss', rec: [4, 7, 6, 3] },
  ],
};

export const rankDistribution = [
  { label: 'First', value: 12 },
  { label: 'Top 3', value: 31 },
  { label: 'Lower down', value: 22 },
  { label: 'Mentioned only', value: 18 },
  { label: 'Not mentioned', value: 17 },
];

export const absentPrompts = [
  { prompt: 'best GLP-1 for type 2 diabetes', demand: 'High', competitor: 'Mounjaro, Trulicity', basis: 'High demand × competitor recommended' },
  { prompt: 'weight loss with Ozempic', demand: 'Rising', competitor: 'Several', basis: 'Demand rising × you are absent' },
  { prompt: 'Ozempic vs Mounjaro cost', demand: 'Med', competitor: 'Mounjaro', basis: 'Decision stage × competitor' },
];

export const citedSources = [
  { domain: 'nih.gov (ADA guideline)', type: 'Academic', citations: 214, support: 'Yes', freshness: '6 mo', persistence: 91 },
  { domain: 'diabetes.org (ADA)', type: 'Third-party', citations: 168, support: 'Yes', freshness: '11 mo', persistence: 84 },
  { domain: 'ozempic.com/pages/xyz', type: 'Your site', citations: 52, support: 'Partly', freshness: '4 mo', persistence: 63 },
  { domain: 'mounjaro.com', type: 'Competitor', citations: 140, support: '—', freshness: '2 mo', persistence: 88 },
];

export const claimValidation = [
  { claim: '"Lowers A1C in adults with type 2 diabetes"', source: 'ozempic.com/label', support: 'Backed' },
  { claim: '"More effective than Mounjaro"', source: 'diabetes.org (unbranded)', support: 'Partly backed' },
];

export const riskQueue = [
  { risk: 'Unsupported claim', severity: 'Critical', issue: '"more effective than Mounjaro"', owner: 'Medical', status: 'In review' },
  { risk: 'Wrong positioning', severity: 'High', issue: 'Off-label weight-loss framing', owner: 'Brand', status: 'Assigned' },
  { risk: 'Outdated info', severity: 'Medium', issue: 'Stale dosing cited from 2023', owner: 'Content', status: 'Open' },
];

export const competitiveRanking = [
  { name: 'Mounjaro', visibility: 61, citation: 34, recommendation: 38 },
  { name: 'Trulicity', visibility: 55, citation: 29, recommendation: 31 },
  { name: 'Jardiance', visibility: 40, citation: 22, recommendation: 20 },
  { name: 'Ozempic', visibility: 42, citation: 18, recommendation: 16 },
];

export const contextualCompetitors = [
  { context: 'Type 2 diabetes · India · doctor', competitor: 'Mounjaro', why: 'Same GLP-1 class, newer' },
  { context: 'Type 2 diabetes · US · patient', competitor: 'Trulicity', why: 'Weekly option, established' },
  { context: 'Weight-loss discussion · US', competitor: 'Mounjaro', why: 'Off-label demand, rival recommended' },
];

export const actions = [
  { action: 'Publish an Ozempic vs Mounjaro comparison page', gap: 'Choosing a diabetes treatment', evidence: '48 questions · Mounjaro recommended more', why: 'Highest demand × widest gap × decision stage — outranks the other gaps', owner: 'Content', agent: 'Content Authority', approval: 'Pending', lift: '+6 points' },
  { action: 'Fix positioning on the label page', gap: 'Wrong positioning', evidence: '3 answers are wrong', why: 'Accuracy risk, but fewer questions than the treatment gap', owner: 'Brand', agent: 'Claims & Risk', approval: 'Approved', lift: '+4 points' },
];

export const lift = [
  { label: 'Appearing more', value: '+8 points', source: 'ahrefs' },
  { label: 'Cited more', value: '+4 points', source: 'bing' },
  { label: 'Recommended more', value: '+3 points', source: 'gemini' },
];

export const noImpact = [
  { intervention: 'Updated all product pages', target: 'Cited by AI', result: 'No change', decision: 'Reopen / revise' },
  { intervention: 'Changed internal links', target: 'Recommended by AI', result: 'Partly', decision: 'Keep watching' },
];

export const agents = ['GEO GPS Prompt Optimizer', 'Content Authority Agent', 'Schema Orchestrator', 'Competitive Intelligence Agent', 'Claims & Risk Reviewer'];

export const dataSources = [
  { capability: 'Appears in answers', data: 'Question → answer → does your brand appear', source: 'Ahrefs', type: 'Third-party' },
  { capability: 'What people ask', data: 'Real-user question volume', source: 'Profound', type: 'Third-party' },
  { capability: 'Cited sources', data: 'Cited URLs, domains', source: 'Bing Webmaster Tools', type: 'Third-party' },
  { capability: 'Recommendations', data: 'Answer runs on tracked questions', source: 'Gemini API', type: 'API' },
  { capability: 'Fact accuracy', data: 'Approved facts, claims, positioning', source: 'Your approved facts', type: 'Internal' },
  { capability: 'Clicks that convert', data: 'Referral + conversion events', source: 'Your CRM', type: 'Internal' },
];

// The "so what" for the biggest opportunity — the 4 context layers from the
// master question: market, users, competitor, business outcome.
export const opportunityContext = [
  { layer: 'Market', text: 'India is a priority market, and diabetes treatment-choice questions are rising 22% quarter on quarter.', source: 'profound' },
  { layer: 'Users', text: 'Doctors ask this at the decision point — 61% of tracked questions are decision-stage.', source: 'profound' },
  { layer: 'Competitor', text: 'Mounjaro is the relevant alternative (same GLP-1 class, newer). It wins because it is the source the AI cites.', source: 'gemini' },
  { layer: 'Business', text: 'This is the treatment decision for the molecule. Winning it targets doctor choice, not just visibility.', source: 'crm' },
];

// The honest boundary: GEO movement is not the same as a business outcome.
export const liftBoundary = "These are GEO movements, not business outcomes. Tying them to doctor choice or sales needs data we don't hold yet — that handoff is open.";

// The signal relationship (GAP 01): how the numbers connect to the leakage.
export const signalRelationship = "The AI cites you more (+2 sources) but doesn't recommend you more. Being cited is not the same as being chosen.";

// The business handoff metric (GAP 05): where GEO stops and CRM starts.
export const businessBoundary = { label: 'AI clicks that convert', value: '3.8%', source: 'crm' };

// --- Role-aware agent -----------------------------------------------------

export type Role = 'exec' | 'strategist' | 'content' | 'medical' | 'pm' | 'admin';

export const ROLES: { key: Role; label: string }[] = [
  { key: 'exec', label: 'Executive' },
  { key: 'strategist', label: 'GEO Strategist' },
  { key: 'content', label: 'Content Operator' },
  { key: 'medical', label: 'Medical / Legal' },
  { key: 'pm', label: 'Product Manager' },
  { key: 'admin', label: 'Platform Admin' },
];

export const roleBriefs: Record<Role, { headline: string; points: string[] }> = {
  exec: {
    headline: 'The problem is being recommended, not showing up.',
    points: [
      'You show up +2 points more, thanks to new citations.',
      'The AI recommends you 16% of the time vs Mounjaro at 38% on diabetes treatment questions.',
      'Closing that gap is the priority.',
    ],
  },
  strategist: {
    headline: 'Diabetes treatment questions are your weakest spot, and the cause is clear.',
    points: [
      'Weight-loss questions: you appear 19% of the time and are almost never recommended.',
      'Mounjaro is recommended more on treatment questions across every assistant.',
      'The gap is everywhere, so it is a content and authority problem.',
    ],
  },
  content: {
    headline: 'Two content gaps to close.',
    points: [
      'No page of yours is cited for diabetes treatment questions — the AI cites Mounjaro instead.',
      'Weight-loss questions are rising and you are not mentioned.',
      'ozempic.com/pages/xyz has a partly-backed claim and needs a refresh.',
    ],
  },
  medical: {
    headline: 'One critical issue to review.',
    points: [
      'Critical: "more effective than Mounjaro" — an unsupported claim.',
      'Positioning is right only 81.5% of the time, down 4.1 points.',
      '3 answers frame weight loss off-label.',
    ],
  },
  pm: {
    headline: 'Two actions in flight, one needs your call.',
    points: [
      'Publish an Ozempic vs Mounjaro comparison page — pending approval, worth about +6 points.',
      'The page-update action changed nothing — reopen or revise.',
      'You need a defensible priority order for recommendations.',
    ],
  },
  admin: {
    headline: 'Coverage is the watch item.',
    points: [
      'Tracked questions vs real questions show a coverage gap.',
      'Bing citation data is stale on 2 sources.',
      'The next Gemini run is scheduled for tonight.',
    ],
  },
};

export function agentRespond(question: string, role: Role): string {
  const q = question.toLowerCase();
  const label = ROLES.find((r) => r.key === role)?.label ?? 'you';

  if (q.includes('recommend') || (q.includes('why') && (q.includes('lag') || q.includes('mounjaro')))) {
    return 'The AI recommends Mounjaro more because Mounjaro is the source the AI cites on diabetes treatment questions, and you have no comparison page of your own. Publishing an Ozempic vs Mounjaro comparison page is the fix — worth about +6 points. Evidence: Mounjaro 38% recommendation vs your 16% · Gemini API.';
  }
  if (q.includes('risk') || q.includes('accuracy') || q.includes('wrong')) {
    return role === 'medical'
      ? 'Your top issue is the "more effective than Mounjaro" claim — unsupported, critical. I would escalate it before the next check. Evidence: positioning 81.5% · Your approved facts.'
      : "There is one critical issue: an unsupported efficacy claim, in medical review. Your positioning is off 4.1 points. Evidence: positioning 81.5% · Your approved facts.";
  }
  if (q.includes('content') || q.includes('gap') || q.includes('missing')) {
    return role === 'content'
      ? 'Two gaps: no page of yours for diabetes treatment questions (the AI cites Mounjaro instead), and weight-loss questions are rising with no mention of you. Start with the Ozempic vs Mounjaro comparison page. Evidence: 48 questions, you appear in 19% · Profound.'
      : 'Two content gaps: diabetes treatment questions have no page of yours, and weight-loss questions are under-covered. Evidence: 48 questions · Profound.';
  }
  if (q.includes('competitor') || q.includes('mounjaro') || q.includes('trulicity')) {
    return 'Mounjaro is recommended more (38%) on diabetes treatment questions because the AI cites Mounjaro there. Trulicity leads on comparing GLP-1 options. You trail wherever you have no comparison content of your own. Evidence: Mounjaro 38% vs you 16% · Gemini API.';
  }
  if (q.includes('what should') || q.includes('priority') || q.includes('do')) {
    return `For you as ${label}: ${roleBriefs[role].headline} ${roleBriefs[role].points[roleBriefs[role].points.length - 1]}`;
  }
  return `As ${label}, your priority is: ${roleBriefs[role].headline}`;
}
