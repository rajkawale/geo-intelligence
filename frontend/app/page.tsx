"use client";

import { useState } from "react";
import {
  SOURCES,
  health,
  largestOpportunity,
  opportunityContext,
  signalRelationship,
  liftBoundary,
  businessBoundary,
  actions,
  lift,
  clusters,
  heatmap,
  rankDistribution,
  citedSources,
  claimValidation,
  riskQueue,
  competitiveRanking,
  contextualCompetitors,
  noImpact,
  agents,
  dataSources,
  ROLES,
  roleBriefs,
  agentRespond,
  type Role,
} from "@/lib/mockData";

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

function SignalMeter({ score }: { score: number }) {
  const segs = 10;
  const on = Math.round(score / 10);
  return (
    <div className="signal" aria-label={`${score} out of 100`}>
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} className={`seg ${i < on ? "on" : ""} ${i < on && score < 70 ? "warn" : ""}`} />
      ))}
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
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
        {actions.map((a, idx) => (
          <div
            key={a.action}
            className={`flex items-center justify-between gap-4 py-4 border-b border-[var(--line)] first:pt-0 last:pb-0 last:border-0 ${idx === 0 ? "border-l-2 border-l-[var(--accent)] pl-4 -ml-5" : ""}`}
          >
            <div>
              <div className="text-[16px] font-medium">{a.action}</div>
              <div className="text-[14px] text-[var(--muted)] mt-1">{a.evidence}</div>
              <div className="text-[14px] text-[var(--accent)] mt-1.5">Why first: {a.why}</div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-[13px] font-medium px-2.5 py-1 rounded ${
                  a.approval === "Approved" ? "bg-[var(--pos-soft)] text-[var(--pos)]" : "bg-[var(--neg-soft)] text-[var(--neg)]"
                }`}
              >
                {a.approval}
              </span>
              <div className="num text-[14px] text-[var(--muted)] mt-1.5">{a.lift}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WhyItMatters() {
  return (
    <Section title="Why it matters" hint="the number, then the meaning">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6">
        <div className="flex items-center gap-4">
          <span className="num text-4xl font-semibold tracking-tight">{health.score}</span>
          <SignalMeter score={health.score} />
          <span className="text-base text-[var(--neg)] font-medium">{health.label}</span>
        </div>

        <div className="text-[17px] font-semibold mt-5">{largestOpportunity.title}</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
          {largestOpportunity.inputs.map((i) => (
            <span key={i.label} className="text-[14px] text-[var(--muted)]">
              <span className="num text-[var(--ink)] font-medium">{i.value}</span> {i.label.toLowerCase()}
            </span>
          ))}
        </div>

        <div className="mt-4 text-[15px] text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--line)] rounded-lg px-5 py-3.5 leading-relaxed">
          {signalRelationship}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {opportunityContext.map((c) => (
            <div key={c.layer} className="bg-[var(--panel-2)] border border-[var(--line)] rounded-lg p-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] uppercase tracking-wider text-[var(--accent)] font-semibold">{c.layer}</span>
                <SourceTag k={c.source} />
              </div>
              <div className="text-[15px] leading-relaxed mt-2.5">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function DidItMove() {
  return (
    <Section title="The result so far" hint="GEO movement, with the honest boundary">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lift.map((l) => (
          <div key={l.label} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
            <div className="text-[13px] text-[var(--muted)]">{l.label}</div>
            <div className="num text-3xl font-semibold text-[var(--pos)] mt-1.5">{l.value}</div>
            <div className="mt-2.5"><SourceTag k={l.source} /></div>
          </div>
        ))}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
          <div className="text-[13px] text-[var(--muted)]">{businessBoundary.label}</div>
          <div className="num text-3xl font-semibold mt-1.5">{businessBoundary.value}</div>
          <div className="mt-2.5"><SourceTag k={businessBoundary.source} /></div>
        </div>
      </div>
      <div className="mt-4 text-[14px] text-[var(--muted)] leading-relaxed bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
        {liftBoundary}
      </div>
    </Section>
  );
}

function VisibilityExplorer() {
  return (
    <>
      <Section title="What people ask — and where you stand" hint="every problem traces to a question">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr><Th>Topic</Th><Th>Why they ask</Th><Th>Appears</Th><Th>Recommended</Th><Th>Where you show up</Th><Th>Who leads</Th><Th>Falling behind</Th><Th>Priority</Th></tr>
              </thead>
              <tbody>
                {clusters.map((c) => (
                  <tr key={c.name} className="hover:bg-[var(--panel-2)]">
                    <Td>{c.name}</Td><Td className="text-[var(--muted)]">{c.intent}</Td>
                    <Td className="num">{c.visibility}%</Td><Td className="num">{c.recommendation}%</Td>
                    <Td>{c.position}</Td><Td className="text-[var(--muted)]">{c.leader}</Td>
                    <Td className={`num font-medium ${c.gap < 0 ? "text-[var(--neg)]" : "text-[var(--pos)]"}`}>{c.gap > 0 ? `+${c.gap}` : c.gap}</Td>
                    <Td><span className={`text-[13px] font-medium px-2.5 py-1 rounded ${c.priority === "High" ? "bg-[var(--neg-soft)] text-[var(--neg)]" : c.priority === "Med" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--line)] text-[var(--muted)]"}`}>{c.priority}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="Which AI assistant recommends you" hint="being recommended is the signal that matters">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><Th>Topic</Th>{heatmap.engines.map((e) => <Th key={e}>{e}</Th>)}</tr></thead>
              <tbody>
                {heatmap.rows.map((r) => (
                  <tr key={r.cluster}>
                    <Td>{r.cluster}</Td>
                    {r.rec.map((v, i) => (
                      <Td key={i}><span className={`num inline-block min-w-[48px] text-center px-2.5 py-1.5 rounded text-sm font-medium ${v < 10 ? "bg-[#0c2a33] text-[#22d3ee]" : v < 25 ? "bg-[#0e3b47] text-[#67e8f9]" : v < 35 ? "bg-[#155e6e] text-white" : "bg-[#22d3ee] text-[#082f3d]"}`}>{v}%</span></Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="Where you show up in the answer" hint="where you land matters">
        <div className="grid grid-cols-5 gap-4">
          {rankDistribution.map((r) => (
            <div key={r.label} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 text-center">
              <div className="num text-2xl font-semibold">{r.value}%</div>
              <div className="text-[13px] text-[var(--muted)] mt-1.5">{r.label}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function CitationIntelligence() {
  return (
    <>
      <Section title="What the AI cites" hint="and whether they back the claim">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><Th>Source</Th><Th>Type</Th><Th>Citations</Th><Th>Backs the claim</Th><Th>How fresh</Th><Th>Cited how often</Th></tr></thead>
              <tbody>
                {citedSources.map((s) => (
                  <tr key={s.domain} className="hover:bg-[var(--panel-2)]">
                    <Td className="font-medium">{s.domain}</Td><Td className="text-[var(--muted)]">{s.type}</Td>
                    <Td className="num">{s.citations}</Td>
                    <Td><span className={`text-[13px] font-medium px-2.5 py-1 rounded ${s.support === "Yes" ? "bg-[var(--pos-soft)] text-[var(--pos)]" : s.support === "Partly" ? "bg-[var(--neg-soft)] text-[var(--neg)]" : "bg-[var(--line)] text-[var(--muted)]"}`}>{s.support}</span></Td>
                    <Td className="text-[var(--muted)]">{s.freshness}</Td><Td className="num">{s.persistence}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="Does the source back the claim" hint="being cited is not the same as being right">
        <div className="space-y-3">
          {claimValidation.map((c) => (
            <div key={c.claim} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-[15px]">{c.claim}</div>
                <div className="text-[14px] text-[var(--muted)] mt-2">source cited: <span className="num">{c.source}</span></div>
              </div>
              <span className={`shrink-0 text-[13px] font-medium px-2.5 py-1 rounded ${c.support === "Backed" ? "bg-[var(--pos-soft)] text-[var(--pos)]" : "bg-[var(--neg-soft)] text-[var(--neg)]"}`}>{c.support}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function AnswerQuality() {
  return (
    <>
      <Section title="Answer accuracy" hint="three checks, not one number">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Facts right", value: "94.2%" },
            { label: "Positioning right", value: "81.5%" },
            { label: "Brand right", value: "91.0%" },
          ].map((a) => (
            <div key={a.label} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
              <div className="text-[13px] text-[var(--muted)]">{a.label}</div>
              <div className="num text-3xl font-semibold mt-1.5">{a.value}</div>
              <div className="mt-2.5"><SourceTag k="kb" /></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Things to fix" hint="each with a next step">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><Th>Issue</Th><Th>How serious</Th><Th>What it is</Th><Th>Owner</Th><Th>Status</Th><Th /></tr></thead>
              <tbody>
                {riskQueue.map((r) => (
                  <tr key={r.issue} className="hover:bg-[var(--panel-2)]">
                    <Td>{r.risk}</Td>
                    <Td><span className={`text-[13px] font-medium px-2.5 py-1 rounded ${r.severity === "Critical" || r.severity === "High" ? "bg-[var(--neg-soft)] text-[var(--neg)]" : "bg-[var(--line)] text-[var(--muted)]"}`}>{r.severity}</span></Td>
                    <Td>{r.issue}</Td><Td className="text-[var(--muted)]">{r.owner}</Td><Td className="text-[var(--muted)]">{r.status}</Td>
                    <Td><button className="text-sm font-medium text-[var(--accent)] hover:underline whitespace-nowrap">Review →</button></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </>
  );
}

function CompetitiveLandscape() {
  return (
    <>
      <Section title="You vs competitors" hint="same questions, same assistants">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><Th>Brand</Th><Th>Appears</Th><Th>Cited</Th><Th>Recommended</Th></tr></thead>
              <tbody>
                {competitiveRanking.map((c) => (
                  <tr key={c.name} className={c.name === "Ozempic" ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--panel-2)]"}>
                    <Td className="font-medium">{c.name}</Td><Td className="num">{c.visibility}%</Td><Td className="num">{c.citation}%</Td><Td className="num">{c.recommendation}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="Who you compete with, by situation" hint="your real rival changes by situation">
        <div className="space-y-3">
          {contextualCompetitors.map((c) => (
            <div key={c.context} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
              <div className="text-[15px] font-medium">{c.context}</div>
              <div className="text-sm text-[var(--muted)] mt-1.5">
                competitor to watch: <span className="font-medium text-[var(--ink)]">{c.competitor}</span> · {c.why}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function ActionsLift() {
  return (
    <>
      <Section title="What you did" hint="every action ties to evidence">
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><Th>Action</Th><Th>Problem</Th><Th>Evidence</Th><Th>Owner</Th><Th>Agent</Th><Th>Status</Th><Th>Expected change</Th></tr></thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.action} className="hover:bg-[var(--panel-2)]">
                    <Td className="font-medium">{a.action}</Td><Td className="text-[var(--muted)]">{a.gap}</Td><Td className="text-[var(--muted)]">{a.evidence}</Td>
                    <Td>{a.owner}</Td><Td className="text-[var(--muted)]">{a.agent}</Td>
                    <Td><span className={`text-[13px] font-medium px-2.5 py-1 rounded ${a.approval === "Approved" ? "bg-[var(--pos-soft)] text-[var(--pos)]" : "bg-[var(--neg-soft)] text-[var(--neg)]"}`}>{a.approval}</span></Td>
                    <Td className="num">{a.lift}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="What didn't move" hint="learn from what didn't move">
          <div className="space-y-3">
            {noImpact.map((n) => (
              <div key={n.intervention} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-medium">{n.intervention}</div>
                  <div className="text-[14px] text-[var(--muted)] mt-1">{n.target}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[13px] bg-[var(--line)] text-[var(--muted)] px-2.5 py-1 rounded">{n.result}</span>
                  <div className="text-[14px] text-[var(--muted)] mt-1.5">{n.decision}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Who does the work" hint="one agent per job">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
            <div className="flex flex-wrap gap-2.5">
              {agents.map((a) => (
                <span key={a} className="text-sm text-[var(--muted)] border border-[var(--line)] px-3 py-1.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}

function DataAndSources() {
  return (
    <Section title="Where the data comes from" hint="the source behind every number">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><Th>What it measures</Th><Th>Data needed</Th><Th>Source</Th><Th>Type</Th></tr></thead>
            <tbody>
              {dataSources.map((d) => (
                <tr key={d.capability} className="hover:bg-[var(--panel-2)]">
                  <Td className="font-medium">{d.capability}</Td><Td className="text-[var(--muted)]">{d.data}</Td><Td className="num">{d.source}</Td>
                  <Td><SourceTag k={Object.keys(SOURCES).find((k) => SOURCES[k].name === d.source) ?? ""} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

function Agent() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>("exec");
  const [messages, setMessages] = useState<{ from: "user" | "agent"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const brief = roleBriefs[role];

  function send() {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "user", text: q }, { from: "agent", text: agentRespond(q, role) }]);
    setInput("");
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
            <span className="text-[13px] uppercase tracking-wider text-[var(--muted)]">You are</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="flex-1 bg-[var(--panel-2)] border border-[var(--line)] rounded-md px-3 py-2 text-[15px] text-[var(--ink)] outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="px-5 py-4 border-b border-[var(--line)] bg-[var(--panel-2)]">
            <div className="text-[13px] uppercase tracking-wider text-[var(--accent)] font-semibold">For you</div>
            <div className="text-[16px] font-semibold mt-1.5 leading-snug">{brief.headline}</div>
            <ul className="mt-2.5 space-y-1.5">
              {brief.points.map((p) => (
                <li key={p} className="text-[14px] text-[var(--muted)] leading-snug flex gap-2">
                  <span className="text-[var(--accent)] shrink-0">·</span>{p}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 max-h-[280px]">
            {messages.length === 0 && (
              <p className="text-[14px] text-[var(--muted)] leading-relaxed">
                Ask about your GEO data — &quot;why the AI recommends you less&quot;, &quot;what&apos;s the biggest issue&quot;, &quot;where the content gap is&quot;.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] text-[15px] leading-relaxed px-3.5 py-2.5 rounded-xl ${
                  m.from === "user" ? "ml-auto bg-[var(--accent)] text-[#082f3d]" : "bg-[var(--panel-2)] text-[var(--ink)]"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--line)] p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about your GEO data…"
                className="flex-1 bg-[var(--panel-2)] border border-[var(--line)] rounded-lg px-3.5 py-2.5 text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
              />
              <button onClick={send} className="bg-[var(--accent)] text-[#082f3d] text-[15px] font-semibold px-4 rounded-lg hover:brightness-110">Send</button>
            </div>
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
            <a href="/analysis" className="text-[var(--accent)] hover:underline">Phase 1 &amp; 2</a>
            <select className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--panel)] text-[var(--ink)]"><option>Market · India</option><option>Market · US</option><option>Market · UK</option><option>Market · EU</option><option>Market · Global</option></select>
            <select className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--panel)] text-[var(--ink)]"><option>Last 30 days</option><option>Last 90 days</option></select>
            <span className="ml-1 inline-flex items-center text-[13px] text-[var(--neg)] bg-[var(--neg-soft)] px-2.5 py-1.5 rounded-md font-medium">MOCK DATA</span>
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
