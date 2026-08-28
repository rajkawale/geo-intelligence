import type { ReactNode } from "react";

const tasks = [
  { n: "1", title: "Resource gap analysis", desc: "Compare the prototype and user stories Amiyangsu shared with the business PRD, and identify what is missing, overlapping, or unclear." },
  { n: "2", title: "Feature and dashboard justification", desc: "Review each representation (heatmaps, KPI views, trend analyses) and decide whether to keep, change, combine, remove, or add it, with the reasoning." },
  { n: "3", title: "Data and implementation strategy", desc: "Map the required data for each capability, where it comes from, and how it flows through the product to support decisions and actions." },
];

const phase1 = [
  { area: "Overview", story: "Executive KPI scorecard, branded vs unbranded, biggest opportunity, explain KPI movement", prototype: "KPI cards, trends, GEO health, opportunity, priority action", prd: "Executive KPI / visibility / competitive metrics", type: "Cross-source inconsistency", gap: "KPI definitions and logic are not represented consistently across the three sources" },
  { area: "Visibility Explorer", story: "Engine comparison, unbranded discovery, high-value gaps, prompt inspection, rank distribution", prototype: "Table, heatmap, rank distribution", prd: "Rank, competitive gap, visibility / citation quadrant", type: "Mostly aligned + overlap to test", gap: "Capability exists across sources; heatmap / table / rank may duplicate decision value" },
  { area: "Citation Intelligence", story: "Citation performance, competitor displacement, claim validation, freshness, persistence", prototype: "Citation KPIs, source table, trends", prd: "Citation share, domains, categories", type: "User story → Prototype / PRD gap", gap: "Claim-level validation, displacement, freshness, and persistence are not fully represented" },
  { area: "Answer Quality and Risk", story: "Risky answers, positioning validation, review decision, outdated information", prototype: "Quality KPIs + risk / review views", prd: "Accuracy / hallucination validation", type: "User story → Prototype gap", gap: "Positioning validation and the review decision workflow need explicit representation" },
  { area: "Competitive Landscape", story: "Benchmarking, quadrant, competitor-owned sources", prototype: "Ranking + quadrant, source displacement", prd: "Competitive visibility gaps, comparison views", type: "Mostly aligned", gap: "Competitor source displacement is in the story and prototype, not explicit in the PRD" },
  { area: "Actions and Lift", story: "Create action, approval, routing, intervention measurement, no-impact review", prototype: "Action tracker, approval, agent queue, measured lift", prd: "Recommendations, optimization, validation; pipeline attribution P2", type: "Business scope boundary", gap: "GEO intervention lift exists; downstream business attribution is not part of current MVP" },
  { area: "Cross-dashboard interactions", story: "Persistent filters, KPI drilldown, evidence drawer, data quality, config", prototype: "Common navigation / context", prd: "Unified dashboard / reporting", type: "User story → Prototype / PRD gap", gap: "Persistent filters, drilldown, and the evidence drawer are in the story but not consistently represented" },
];

const phase2 = [
  { section: "Overview", features: [
    { feature: "KPI cards", question: "How are we performing now?", decision: "Where to focus", best: "Yes, but no priority or cause", verdict: "Keep + simplify" },
    { feature: "Visibility vs citation trend", question: "What changed?", decision: "Whether to investigate", best: "Yes as a trigger, not a driver", verdict: "Change" },
    { feature: "Branded vs unbranded", question: "Are we found without the brand name?", decision: "Recognition vs discovery gap", best: "Partially, needs context", verdict: "Keep + connect" },
    { feature: "Largest opportunity", question: "What to investigate first?", decision: "Where to put resources", best: "Concept yes, ranking unclear", verdict: "Change" },
    { feature: "Priority action", question: "What to do next?", decision: "What to act on", best: "Yes if evidence-backed", verdict: "Change" },
    { feature: "Sentiment", question: "How are we perceived?", decision: "Whether perception needs action", best: "PRD only", verdict: "Decide" },
  ]},
  { section: "Visibility Explorer", features: [
    { feature: "Prompt-cluster table", question: "Which questions are weak, and who wins?", decision: "Where the gap is", best: "Yes, mostly", verdict: "Keep + strengthen" },
    { feature: "Engine heatmap", question: "Where are the engine gaps?", decision: "Cross-engine pattern", best: "Maybe, duplicates the table", verdict: "Validate / combine" },
    { feature: "Rank distribution", question: "Where do we sit in the answer?", decision: "Position vs presence", best: "Yes", verdict: "Keep" },
    { feature: "Absent-priority prompts", question: "Where are we absent?", decision: "Discovery gaps", best: "Partially, priority basis unclear", verdict: "Keep + strengthen" },
    { feature: "Exact prompt inspection", question: "What exact question failed?", decision: "Root cause", best: "Yes", verdict: "Keep" },
  ]},
  { section: "Citation Intelligence", features: [
    { feature: "Source table", question: "Which sources carry the answers?", decision: "Source strategy", best: "Mostly, needs claim linkage", verdict: "Keep + deepen" },
    { feature: "Competitor source displacement", question: "Where do competitors win evidence?", decision: "Source opportunity", best: "Yes", verdict: "Keep" },
    { feature: "Source-to-claim validation", question: "Does the source back the claim?", decision: "Trust in the evidence", best: "Not represented", verdict: "Add" },
    { feature: "Freshness / persistence", question: "Is evidence stable over time?", decision: "Risk from stale sources", best: "Partially", verdict: "Keep + connect" },
  ]},
  { section: "Answer Quality and Risk", features: [
    { feature: "Accuracy KPI", question: "Are the answers accurate?", decision: "Quality baseline", best: "Yes, no severity or context", verdict: "Keep" },
    { feature: "Positioning validation", question: "Is the brand positioned correctly?", decision: "Brand representation", best: "Partially, workflow unclear", verdict: "Keep + represent" },
    { feature: "Risk queue", question: "What needs human review?", decision: "Prioritize review", best: "Mostly", verdict: "Keep + strengthen" },
    { feature: "Review decision", question: "What happens after a risk is found?", decision: "Close the quality loop", best: "Not represented", verdict: "Add" },
    { feature: "Knowledge base", question: "What is accuracy measured against?", decision: "Trustworthy accuracy", best: "Not represented", verdict: "Add" },
  ]},
  { section: "Competitive Landscape", features: [
    { feature: "Competitive ranking", question: "Where do we stand vs rivals?", decision: "Benchmark", best: "Yes", verdict: "Keep" },
    { feature: "Visibility × citation quadrant", question: "Who leads, in what dimension?", decision: "Competitive position", best: "Partially, no cause", verdict: "Keep + deepen" },
    { feature: "Source displacement", question: "Where do competitors own evidence?", decision: "Intervention opportunity", best: "Yes", verdict: "Keep" },
    { feature: "Contextual competitor set", question: "Which rival matters here?", decision: "The right benchmark", best: "Not represented", verdict: "Add context" },
  ]},
  { section: "Actions and Lift", features: [
    { feature: "Action creation", question: "What should be done?", decision: "Turn insight into work", best: "Partially, evidence must stay attached", verdict: "Keep + strengthen" },
    { feature: "Approval workflow", question: "Can the action be controlled?", decision: "Governance", best: "Yes", verdict: "Keep" },
    { feature: "Measured GEO lift", question: "Did the action move GEO?", decision: "Close the loop", best: "Yes for GEO", verdict: "Keep + define boundary" },
    { feature: "No-impact review", question: "What did not work?", decision: "Learn from misses", best: "Yes", verdict: "Keep" },
    { feature: "Recommendation priority", question: "Where to act first?", decision: "Allocate effort", best: "Not explainable", verdict: "Change" },
    { feature: "Agent routing", question: "Who does the work?", decision: "Route to a specialist", best: "Not represented", verdict: "Add" },
  ]},
  { section: "Cross-cutting", features: [
    { feature: "Data provenance", question: "Where does each number come from?", decision: "Trust the number", best: "Not represented", verdict: "Add" },
    { feature: "Drivers / contribution", question: "Why did the number move?", decision: "Diagnose the cause", best: "Not represented", verdict: "Add" },
  ]},
];

function Th({ children }: { children?: ReactNode }) {
  return <th className="text-left text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider px-4 py-3 border-b border-[var(--line)] align-top">{children}</th>;
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 border-b border-[var(--line)] text-[14px] align-top ${className}`}>{children}</td>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function AnalysisPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--panel)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Phase 1 and 2</h1>
          <a href="/" className="text-sm text-[var(--accent)] hover:underline">&larr; Back to the dashboard</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8">
        <Section title="The task">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tasks.map((t) => (
              <div key={t.n} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
                <div className="num text-sm font-bold text-[var(--accent)]">{t.n}</div>
                <div className="text-[15px] font-medium mt-2">{t.title}</div>
                <div className="text-[14px] text-[var(--muted)] mt-1.5 leading-relaxed">{t.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Phase 1 — three-way comparison">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr><Th>Area</Th><Th>Amiyangsu / user story</Th><Th>Prototype / mockup</Th><Th>Business PRD</Th><Th>Gap type</Th><Th>Exact gap</Th></tr>
                </thead>
                <tbody>
                  {phase1.map((r) => (
                    <tr key={r.area} className="hover:bg-[var(--panel-2)]">
                      <Td className="font-medium">{r.area}</Td>
                      <Td className="text-[var(--muted)]">{r.story}</Td>
                      <Td className="text-[var(--muted)]">{r.prototype}</Td>
                      <Td className="text-[var(--muted)]">{r.prd}</Td>
                      <Td><span className="text-[12px] font-medium text-[var(--accent)]">{r.type}</span></Td>
                      <Td className="text-[var(--muted)]">{r.gap}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="Phase 2 — feature justification">
          <div className="space-y-8">
            {phase2.map((s) => (
              <div key={s.section}>
                <h3 className="text-[15px] font-semibold mb-3">{s.section}</h3>
                <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr><Th>Feature</Th><Th>Question it answers</Th><Th>Decision it enables</Th><Th>Best representation?</Th><Th>Verdict</Th></tr>
                      </thead>
                      <tbody>
                        {s.features.map((f) => (
                          <tr key={f.feature} className="hover:bg-[var(--panel-2)]">
                            <Td className="font-medium">{f.feature}</Td>
                            <Td className="text-[var(--muted)]">{f.question}</Td>
                            <Td className="text-[var(--muted)]">{f.decision}</Td>
                            <Td className="text-[var(--muted)]">{f.best}</Td>
                            <Td><span className="text-[12px] font-medium text-[var(--accent)]">{f.verdict}</span></Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
