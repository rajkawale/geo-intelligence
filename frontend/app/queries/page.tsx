"use client";

import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "@/lib/ThemeToggle";
import { apiFetch } from "@/lib/api";

const BRANDS = ["Wegovy", "Ozempic", "CagriSema"];

type Run = {
  id: string;
  brand: string;
  run_date: string;
  engine_name: string;
  topic: string | null;
  persona: string | null;
  tags: string[];
  prompt_text: string;
  mentions: string[];
  gap_status: "won" | "contested" | "lost" | "absent";
};

type Summary = Record<string, { won: number; contested: number; lost: number; absent: number; total: number }>;

const GAP_LABEL: Record<Run["gap_status"], string> = {
  won: "Won — brand only",
  contested: "Contested — both named",
  lost: "Lost — competitor only",
  absent: "Absent — neither named",
};

function GapTag({ status }: { status: Run["gap_status"] }) {
  const style =
    status === "won"
      ? { color: "var(--pos)", background: "var(--pos-soft)" }
      : status === "lost"
      ? { color: "var(--neg)", background: "var(--neg-soft)" }
      : status === "contested"
      ? { color: "var(--accent)", background: "var(--accent-soft)" }
      : { color: "var(--muted)", background: "var(--line)" };
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide" style={style}>
      {status}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider px-4 py-3 border-b border-[var(--line)] align-top">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 border-b border-[var(--line)] text-[14px] align-top ${className}`}>{children}</td>;
}

export default function QueriesPage() {
  const [brand, setBrand] = useState("Wegovy");
  const [gapStatus, setGapStatus] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Run[] | null>(null);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [narration, setNarration] = useState<string | null>(null);
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRows = useCallback(async (cancelledRef: { current: boolean }) => {
    const params = new URLSearchParams({ brand, limit: "50" });
    if (gapStatus) params.set("gap_status", gapStatus);
    if (q) params.set("q", q);
    try {
      const res = await apiFetch(`/api/profound-runs?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${res.status}`);
      if (cancelledRef.current) return;
      setRows(data.rows ?? []);
      setTotal(data.total ?? 0);
      setError(null);
    } catch (e) {
      if (cancelledRef.current) return;
      const msg = e instanceof Error ? e.message : "unknown error";
      setError(
        msg.includes("Failed to fetch")
          ? "Can't reach the GEO I backend. Is `npm run start` running in backend/?"
          : msg.includes("profound_runs")
          ? "MIGRATION_NEEDED"
          : `Backend error: ${msg}`
      );
      setRows([]);
    }
  }, [brand, gapStatus, q]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/profound-runs/summary`);
      if (!res.ok) return;
      setSummary(await res.json());
    } catch {
      // summary is a nice-to-have; loadRows already surfaces the connection error
    }
  }, []);

  useEffect(() => {
    // A fast brand/filter switch can let a slower, earlier request resolve
    // after a later one and overwrite it with stale rows — same race caught
    // on the main dashboard's brand switcher, fixed the same way here.
    const cancelledRef = { current: false };
    loadRows(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [loadRows]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const askInsight = async () => {
    if (!summary?.[brand]) return;
    setNarrationLoading(true);
    setNarration(null);
    try {
      const res = await apiFetch(`/api/insight-narration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, summary: summary[brand] }),
      });
      const data = await res.json();
      setNarration(data.narration ?? data.error ?? "No narration returned.");
    } catch {
      setNarration("Couldn't reach the backend for narration.");
    } finally {
      setNarrationLoading(false);
    }
  };

  const brandSummary = summary?.[brand];
  const migrationNeeded = error === "MIGRATION_NEEDED";

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--panel)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-xl font-semibold tracking-tight">Real queries</h1>
          <div className="flex gap-2 text-sm items-center">
            <a href="/" className="text-[var(--accent)] hover:underline">&larr; Back to the dashboard</a>
            <span className="ml-1 inline-flex items-center text-[13px] text-[var(--pos)] bg-[var(--pos-soft)] px-2.5 py-1.5 rounded-md font-medium">LIVE — PROFOUND</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8">
        <p className="text-[14px] text-[var(--muted)] mb-6 max-w-2xl">
          Every row below is a real prompt Profound saw a real person ask an AI engine, with the real answer it got.
          Gap status compares whether the brand, a named competitor, both, or neither showed up in that answer.
        </p>

        <div className="flex gap-2 mb-6">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                brand === b ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {error && migrationNeeded && (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6 mb-6 text-sm text-[var(--muted)] leading-relaxed">
            No data yet. Run migration <code className="text-[var(--ink)]">db/migrations/003_profound_runs.sql</code> in
            the Supabase SQL editor, then <code className="text-[var(--ink)]">cd backend &amp;&amp; npm run job:fetch-profound</code> to
            pull the real data in.
          </div>
        )}
        {error && !migrationNeeded && (
          <div className="bg-[var(--neg-soft)] border border-[var(--neg)] text-[var(--neg)] rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}
        {rows !== null && rows.length === 0 && !error && (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6 mb-6 text-sm text-[var(--muted)]">No {brand} rows match these filters.</div>
        )}

        {brandSummary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {(["total", "won", "contested", "lost", "absent"] as const).map((k) => (
              <div key={k} className={`bg-[var(--panel)] border rounded-xl p-4 ${k === "total" ? "border-[var(--accent)]" : "border-[var(--line)]"}`}>
                <div className={`num text-2xl font-bold ${k === "total" ? "text-[var(--accent)]" : ""}`}>{brandSummary[k]}</div>
                <div className="text-[12px] text-[var(--muted)] mt-1 capitalize">{k === "total" ? "runs pulled" : k}</div>
              </div>
            ))}
          </div>
        )}

        {brandSummary && (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold">Ask I &mdash; insight narration</span>
              <button onClick={askInsight} disabled={narrationLoading} className="text-[13px] text-[var(--accent)] hover:underline disabled:opacity-50">
                {narrationLoading ? "Thinking…" : "Narrate this gap"}
              </button>
            </div>
            {narration && <p className="text-[14px] leading-relaxed text-[var(--ink)]">{narration}</p>}
            {!narration && <p className="text-[13px] text-[var(--muted)]">Gemini, internal only &mdash; turns the counts above into a sentence a strategist can act on.</p>}
          </div>
        )}

        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <select
            value={gapStatus}
            onChange={(e) => setGapStatus(e.target.value)}
            className="bg-[var(--panel)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)]"
          >
            <option value="">All gap statuses</option>
            {(["won", "contested", "lost", "absent"] as const).map((s) => (
              <option key={s} value={s}>{GAP_LABEL[s]}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompt text…"
            className="bg-[var(--panel)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] flex-1 min-w-[200px]"
          />
          {total > 0 && <span className="text-[13px] text-[var(--muted)]">{total} matching</span>}
        </div>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr><Th>Prompt</Th><Th>Engine</Th><Th>Persona</Th><Th>Tags</Th><Th>Mentions</Th><Th>Gap</Th></tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--panel-2)]">
                    <Td className="font-medium max-w-[320px]">{r.prompt_text}</Td>
                    <Td className="text-[var(--muted)] whitespace-nowrap">{r.engine_name}</Td>
                    <Td className="text-[var(--muted)] whitespace-nowrap">{r.persona ?? "General"}</Td>
                    <Td className="text-[var(--muted)]">{(r.tags ?? []).join(", ")}</Td>
                    <Td className="text-[var(--muted)]">{(r.mentions ?? []).join(", ") || "—"}</Td>
                    <Td><GapTag status={r.gap_status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
