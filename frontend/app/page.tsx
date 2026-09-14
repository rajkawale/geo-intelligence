"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "@/lib/ThemeToggle";
import { SOURCES } from "@/lib/mockData";

const API = process.env.NEXT_PUBLIC_GEOI_API_URL || "http://localhost:4000";
const REAL_BRANDS = ["Wegovy", "Ozempic", "CagriSema"];
type GapSummary = Record<string, { won: number; contested: number; lost: number; absent: number; total: number }>;

function SourceTag({ k }: { k: string }) {
  const s = SOURCES[k];
  if (!s) return null;
  const cls = s.type === "Third-party" ? "third-party" : s.type === "Internal" ? "internal" : "api";
  return (
    <span className={`provenance ${cls}`} title={`${s.type} · ${s.name}`}>
      <span className="dot" />
      {s.name}
    </span>
  );
}

// A killed feature: no fabricated numbers, just the real reason it's not
// here yet and what would make it real. Per the audit in this session —
// every feature on this dashboard needs a "why does this exist" that
// survives contact with real data, or it gets pulled, not left as a mock.
function Pending({ needs, note }: { needs: string; note?: string }) {
  return (
    <div className="bg-[var(--panel)] border border-dashed border-[var(--line)] rounded-xl p-6 text-[14px] text-[var(--muted)] leading-relaxed">
      <span className="font-medium text-[var(--ink)]">Not built.</span> Needs {needs} — no real data behind this yet, so it's not shown as if there were. {note}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider px-4 py-3 border-b border-[var(--line)]">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 border-b border-[var(--line)] text-[15px] ${className}`}>{children}</td>;
}

function Section({ title, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  );
}

function WhatToDo() {
  return (
    <Section title="What to do" hint="the decision, then the evidence">
      <Pending needs="GEO Craft" note="This showed two fabricated actions ('publish a comparison page', 'fix positioning') that were never actually taken — killed rather than imply work happened. Once Craft exists, real content-gap briefs land here." />
    </Section>
  );
}

function WhyItMatters() {
  return (
    <Section title="Why it matters" hint="a made-up health score and a hardcoded opportunity — replaced by the real thing above">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6 text-[14px] text-[var(--muted)] leading-relaxed">
        <span className="font-medium text-[var(--ink)]">Killed, not rebuilt.</span> This used to show a health score with
        arbitrary weights (40/30/30, never validated) and a hardcoded "opportunity" about diabetes-treatment questions in
        India — leftover from the old Ozempic demo, unrelated to the real Wegovy data above. The real version of "why it
        matters" is the Real signal panel and Ask I's narration, both live. Didn't fabricate a replacement just to fill
        this space.
      </div>
    </Section>
  );
}

function RealSignal() {
  const [brand, setBrand] = useState("Wegovy");
  const [summary, setSummary] = useState<GapSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/profound-runs/summary`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `${r.status}`);
        setSummary(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Can't reach the backend"));
  }, []);

  const s = summary?.[brand];
  const pct = (n: number) => (s && s.total ? Math.round((n / s.total) * 1000) / 10 : 0);

  return (
    <Section title="Real signal" hint="Profound, live — separate from the mock KPIs on this page">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex gap-2">
          {REAL_BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border ${
                brand === b ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <a href="/queries" className="text-[13px] text-[var(--accent)] hover:underline">See the real queries &rarr;</a>
      </div>

      {error && (
        <div className="bg-[var(--neg-soft)] border border-[var(--neg)] text-[var(--neg)] rounded-xl p-4 text-sm">
          {error.includes("profound_runs")
            ? `No real data pulled yet for ${brand}. Run backend: npm run job:fetch-profound`
            : error}
        </div>
      )}

      {!error && s && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[var(--panel)] border border-[var(--accent)] rounded-xl p-5">
            <div className="text-[13px] text-[var(--muted)]">Visibility rate</div>
            <div className="num text-3xl font-semibold text-[var(--accent)] mt-1.5">{pct(s.won + s.contested)}%</div>
            <div className="mt-2.5 text-[11px] text-[var(--muted)]">brand named, any capacity</div>
          </div>
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
            <div className="text-[13px] text-[var(--muted)]">Won</div>
            <div className="num text-3xl font-semibold text-[var(--pos)] mt-1.5">{s.won}</div>
            <div className="mt-2.5 text-[11px] text-[var(--muted)]">brand only</div>
          </div>
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
            <div className="text-[13px] text-[var(--muted)]">Contested</div>
            <div className="num text-3xl font-semibold mt-1.5">{s.contested}</div>
            <div className="mt-2.5 text-[11px] text-[var(--muted)]">brand + competitor</div>
          </div>
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
            <div className="text-[13px] text-[var(--muted)]">Lost</div>
            <div className="num text-3xl font-semibold text-[var(--neg)] mt-1.5">{s.lost}</div>
            <div className="mt-2.5 text-[11px] text-[var(--muted)]">competitor only</div>
          </div>
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
            <div className="text-[13px] text-[var(--muted)]">Runs pulled</div>
            <div className="num text-3xl font-semibold mt-1.5">{s.total}</div>
            <div className="mt-2.5"><SourceTag k="profound" /></div>
          </div>
        </div>
      )}

      {!error && !s && <div className="text-[13px] text-[var(--muted)]">Loading&#8230;</div>}
    </Section>
  );
}

function DidItMove() {
  return (
    <Section title="The result so far" hint="whether Wegovy's real numbers actually moved — not attribution">
      <Pending needs="your CRM (AI-referral tracking)" note="This showed a fake +18% visibility lift and $340k attributed revenue — numbers nobody produced, from a Phase 3 dependency that doesn't exist yet. Once real GEO work goes live through Craft, movement shows as a before/after on the real signal panel above; revenue attribution needs the CRM link in the roadmap." />
    </Section>
  );
}

type EngineBreakdown = Record<string, { won: number; contested: number; lost: number; absent: number; total: number }>;

function EngineHeatmap() {
  const [brand, setBrand] = useState("Wegovy");
  const [data, setData] = useState<EngineBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    fetch(`${API}/api/profound-runs/by-engine?brand=${brand}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `${r.status}`);
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Can't reach the backend"));
  }, [brand]);

  const engines = data ? Object.keys(data) : [];

  return (
    <Section title="Visibility rate by engine" hint="real, per engine — replaces a hardcoded 4-engine table that was never wired to anything">
      <div className="flex gap-2 mb-4">
        {REAL_BRANDS.map((b) => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border ${
              brand === b ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {b}
          </button>
        ))}
      </div>
      {error && <div className="bg-[var(--neg-soft)] border border-[var(--neg)] text-[var(--neg)] rounded-xl p-4 text-sm">{error}</div>}
      {!error && !data && <div className="text-[13px] text-[var(--muted)]">Loading&#8230;</div>}
      {!error && data && engines.length === 0 && (
        <div className="text-[13px] text-[var(--muted)]">No real data pulled yet for {brand}.</div>
      )}
      {!error && data && engines.length > 0 && (
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><Th>Engine</Th><Th>Visibility rate</Th><Th>Won</Th><Th>Contested</Th><Th>Lost</Th><Th>Real runs</Th></tr></thead>
              <tbody>
                {engines.map((e) => {
                  const d = data[e];
                  const vis = d.total ? Math.round(((d.won + d.contested) / d.total) * 1000) / 10 : 0;
                  return (
                    <tr key={e} className="hover:bg-[var(--panel-2)]">
                      <Td className="font-medium">{e}</Td>
                      <Td>
                        <span className={`num inline-block min-w-[56px] text-center px-2.5 py-1.5 rounded text-sm font-medium ${vis < 10 ? "bg-[var(--neutral-100)] text-[var(--neutral-600)]" : vis < 25 ? "bg-[var(--primary-light-background)] text-[var(--primary)]" : vis < 35 ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-background-hover)] text-white"}`}>{vis}%</span>
                      </Td>
                      <Td className="num text-[var(--pos)]">{d.won}</Td>
                      <Td className="num">{d.contested}</Td>
                      <Td className="num text-[var(--neg)]">{d.lost}</Td>
                      <Td className="num text-[var(--muted)]">{d.total}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Section>
  );
}

function VisibilityExplorer() {
  return (
    <>
      <Section title="What people ask — and where you stand" hint="every problem traces to a question">
        <p className="text-[14px] text-[var(--muted)] mb-3">
          This used to be a fabricated topic table (fake "who leads," fake "position"). Neither is something Profound's
          data actually gives us per topic yet. The real, working version of this question is the query explorer —
          every real prompt, filterable, with the real answer and real gap status.
        </p>
        <a href="/queries" className="inline-block text-[14px] font-medium text-[var(--accent)] hover:underline">Open the real query explorer &rarr;</a>
      </Section>

      <EngineHeatmap />

      <Section title="Where you show up in the answer" hint="rank/position inside the answer">
        <Pending needs="answer-text position parsing" note="Profound gives us who's mentioned, not where in the answer they land — that needs parsing the actual answer text, not built yet." />
      </Section>
    </>
  );
}

function CitationIntelligence() {
  return (
    <>
      <Section title="What the AI cites" hint="real citation URLs come through Profound — domain-level aggregation isn't built">
        <Pending
          needs="domain aggregation over real citation data"
          note="Every real run already carries real citation URLs (see a row's raw data in /queries). Rolling them up into a domain-frequency table is real, buildable work — just not done yet. Rebuilt, not left as the old fake domain list."
        />
      </Section>

      <Section title="Does the source back the claim" hint="being cited is not the same as being right">
        <Pending needs="your approved facts (a knowledge base)" note="Explicitly out of scope for this phase per the product spec — MVP-scoped but not started." />
      </Section>
    </>
  );
}

function AnswerQuality() {
  return (
    <>
      <Section title="Answer accuracy" hint="facts right / positioning right / brand right">
        <Pending needs="your approved facts (a knowledge base)" note="There's nothing to check accuracy against yet — killed the fake 94.2%/81.5%/91.0% rather than keep numbers with no reference to be accurate against." />
      </Section>

      <Section title="Things to fix" hint="a medical/legal review queue">
        <Pending needs="a review workflow tied to real flagged answers" note="Also depends on the knowledge base above to know what counts as wrong." />
      </Section>
    </>
  );
}

function CompetitiveLandscape() {
  return (
    <Section title="You vs competitors" hint="real competitor names are already in every mention — ranking them isn't built">
      <Pending
        needs="per-competitor aggregation over real mention data"
        note={'Real example, from the actual data: filter /queries to "Lost" and the Mentions column is dominated by one name — that IS the competitive signal. A ranked rollup of it is real, buildable work, not done yet.'}
      />
    </Section>
  );
}

function ActionsLift() {
  return (
    <>
      <Section title="What you did" hint="every action ties to evidence">
        <Pending needs="GEO Craft" note="No content has actually been created or published yet — this needs the content-creation product, which doesn't exist. Killed the two fake actions rather than show work that didn't happen." />
      </Section>
      <Section title="Who does the work" hint="agent routing">
        <Pending needs="GEO GPS and GEO Craft to exist" note="The 5 fake agent names (“Content Authority Agent” etc.) named products/roles that were never built. Removed rather than imply a routing system exists." />
      </Section>
    </>
  );
}

const REAL_DATA_SOURCES = [
  { capability: "Real queries + gap diagnosis", source: "Profound", type: "profound", status: "Live", statusTone: "pos" as const },
  { capability: "Insight narration (Ask I)", source: "Gemini API", type: "gemini", status: "Live, internal only", statusTone: "pos" as const },
  { capability: "Citation domain authority", source: "Ahrefs", type: "ahrefs", status: "No free tier — $129-$10k/mo, your call", statusTone: "neg" as const },
  { capability: "First-party crawl/index health", source: "Bing Webmaster Tools", type: "bing", status: "Free, blocked on domain access", statusTone: "neg" as const },
  { capability: "Fact accuracy reference", source: "Your approved facts", type: "kb", status: "Not built", statusTone: "muted" as const },
  { capability: "AI-referral conversion", source: "Your CRM", type: "crm", status: "Not built — Phase 3", statusTone: "muted" as const },
];

function DataAndSources() {
  return (
    <Section title="Where the data comes from" hint="the real state, not the original demo's">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><Th>Capability</Th><Th>Source</Th><Th>Status</Th></tr></thead>
            <tbody>
              {REAL_DATA_SOURCES.map((d) => (
                <tr key={d.capability} className="hover:bg-[var(--panel-2)]">
                  <Td className="font-medium">{d.capability}</Td>
                  <Td><SourceTag k={d.type} /></Td>
                  <Td className={d.statusTone === "pos" ? "text-[var(--pos)]" : d.statusTone === "neg" ? "text-[var(--neg)]" : "text-[var(--muted)]"}>{d.status}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

// Real Gemini narration, same endpoint the /queries page uses — this used to be
// a scripted chatbot (agentRespond()) with per-role canned answers, both fake.
// Killed the chat framing since there's no real Q&A pipeline; kept the "Ask I"
// name for the one thing that IS real: turn a brand's real gap counts into a sentence.
function Agent() {
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState("Wegovy");
  const [summary, setSummary] = useState<GapSummary[string] | null>(null);
  const [narration, setNarration] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNarration(null);
    fetch(`${API}/api/profound-runs/summary`)
      .then((r) => r.json())
      .then((d: GapSummary) => setSummary(d[brand] ?? null))
      .catch(() => setSummary(null));
  }, [open, brand]);

  async function narrate() {
    if (!summary) return;
    setLoading(true);
    setNarration(null);
    try {
      const res = await fetch(`${API}/api/insight-narration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, summary }),
      });
      const data = await res.json();
      setNarration(data.narration ?? data.error ?? "No narration returned.");
    } catch {
      setNarration("Can't reach the backend for narration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] text-base font-semibold px-5 py-3 rounded-full shadow-lg hover:border-[var(--accent)] transition"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          Ask <span className="roman">I</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-30 w-[400px] max-h-[78vh] flex flex-col bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--pos)]" />
              <span className="text-base font-semibold">Ask <span className="roman">I</span></span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)] text-2xl leading-none">×</button>
          </div>

          <div className="px-5 py-3 border-b border-[var(--line)] flex items-center gap-2">
            <span className="text-[13px] uppercase tracking-wider text-[var(--muted)]">Brand</span>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="flex-1 bg-[var(--panel-2)] border border-[var(--line)] rounded-md px-3 py-2 text-[15px] text-[var(--ink)] outline-none"
            >
              {REAL_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {!summary && <p className="text-[14px] text-[var(--muted)] leading-relaxed">Loading {brand}&apos;s real numbers&#8230;</p>}
            {summary && !narration && !loading && (
              <p className="text-[14px] text-[var(--muted)] leading-relaxed">
                {summary.total.toLocaleString()} real runs for {brand}: {summary.won} won, {summary.contested} contested,{" "}
                {summary.lost} lost, {summary.absent} absent. Gemini turns this into a sentence a strategist can act on
                — not a second measurement, just a read of what Profound already found.
              </p>
            )}
            {loading && <p className="text-[14px] text-[var(--muted)]">Thinking&#8230;</p>}
            {narration && <p className="text-[15px] leading-relaxed text-[var(--ink)]">{narration}</p>}
          </div>

          <div className="border-t border-[var(--line)] p-3">
            <button
              onClick={narrate}
              disabled={!summary || loading}
              className="w-full bg-[var(--accent)] text-white text-[15px] font-semibold px-4 py-2.5 rounded-lg hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Thinking…" : "Narrate this gap"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [view, setView] = useState("overview");

  const navItems = [
    { key: "overview", label: "Overview" },
    { key: "visibility", label: "Visibility" },
    { key: "citations", label: "Citations" },
    { key: "competitors", label: "Competitors" },
    { key: "quality", label: "Answer quality" },
    { key: "actions", label: "Actions" },
    { key: "sources", label: "Data sources" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--panel)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">GEO Intelligence</h1>
          </div>
          <div className="flex gap-2 text-sm items-center">
            <a href="/queries" className="text-[var(--accent)] hover:underline">Real queries</a>
            <a href="/analysis" className="text-[var(--accent)] hover:underline">Gap analysis</a>
            <span className="ml-1 inline-flex items-center text-[13px] text-[var(--pos)] bg-[var(--pos-soft)] px-2.5 py-1.5 rounded-md font-medium">LIVE — PROFOUND</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav className="border-b border-[var(--line)] bg-[var(--paper)] sticky top-[73px] z-10">
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center gap-7 flex-wrap">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`py-3.5 text-base font-medium border-b-2 -mb-px transition ${view === item.key ? "border-[var(--accent)] text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full px-6 py-8">
        {view === "overview" && (
          <>
            <RealSignal />
            <WhatToDo />
            <WhyItMatters />
            <DidItMove />
          </>
        )}
        {view === "visibility" && <VisibilityExplorer />}
        {view === "citations" && <CitationIntelligence />}
        {view === "competitors" && <CompetitiveLandscape />}
        {view === "quality" && <AnswerQuality />}
        {view === "actions" && <ActionsLift />}
        {view === "sources" && <DataAndSources />}
      </main>

      <Agent />
    </div>
  );
}
