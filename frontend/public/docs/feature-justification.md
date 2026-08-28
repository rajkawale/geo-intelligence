# GEO Intelligence (I) — what we show, and why

## The master question

> Can we explain how a change in GEO performance connects to changing market opportunity, actual user/HCP behaviour and competitive position — and ultimately whether the brand is moving toward its business outcome?

Every choice below is judged against that one question.

## The decision that shaped the UI

A generic metric dashboard reports numbers. A decision system tells you what to do and why. We built the second.

## Why a metric dashboard is the wrong default

A metric dashboard answers two questions well:

1. What happened — "visibility is 42% in India"
2. Where — "HCP treatment-selection questions are weaker than competitor B"

It stops before the third:

3. So what — "is this an important decision point, and would fixing it matter?"

That third question is where the decision lives. The same 42% visibility is irrelevant in a low-priority market and urgent at a high-priority decision point. A number on its own can't tell the two apart. That is the gap a metric dashboard leaves open, and it is exactly the gap the master question names.

| | Metric dashboard | Decision system |
|---|---|---|
| Shows | numbers, each with a source | one decision, with the evidence behind it |
| Answers | what happened, where | what to do, and why this first |
| Center of the screen | the metrics | the "so what" |
| What a manager does with it | reads, then decides themselves | reads, then acts |

The choice is not cosmetic. It changes what a metric is for. In a dashboard, a metric is the destination. Here, a metric is evidence for a decision question, and nothing more.

## The rule every feature was judged by

A number only earns screen space if it answers one of three questions:

1. What changed
2. Why it matters
3. Did it move

If it doesn't, it drops out. This is what removed Share of Voice and moved Brand Accuracy out of the health score (details below).

## The complete exercise

### Stage 1 — what changed

| Metric | Question it answers | Call | How to show it |
|---|---|---|---|
| Recommendation rate | what happened | keep, lead metric | "Recommended by AI", front and center |
| AI visibility | what happened | keep, signal | "Appears in AI answers", never alone, always next to recommendation |
| Citation share | what happened | keep, signal | "Cited by AI", paired with recommendation so a citation that doesn't convert is visible |
| Share of voice | what happened | remove | redundant with visibility and recommendation, a leftover SEO metric |
| Brand accuracy | is the answer right | keep, move | risk, not GEO performance, so it lives under "things to fix" |
| AI referral conversion | did the business move | keep, boundary | shown last, with the "GEO ≠ sales" note |

### Stage 2 — where and for whom

| Metric | Question it answers | Call | How to show it |
|---|---|---|---|
| Prompt clusters / topics | where is the leakage | keep, evidence | behind the agent, tagged to the opportunity |
| Intent / journey stage | for whom, at what point | keep, evidence | a dimension on the opportunity, not a dashboard |
| Engine (which AI) | where, which assistant | keep, evidence | the heatmap, behind the agent |
| Position / rank | where you land | keep, evidence | "where you show up", behind the agent |
| Competitor gap | against whom | keep, needs context | never shown without "which rival really matters" |
| Citations / sources | why competitor wins (partial) | keep, evidence | "what the AI cites", behind the agent |
| Claim validation / risk | is the answer right | keep | "things to fix", each with a next step |

### Stage 3 — why it matters (the gap)

| Element | Question it answers | Call | How to show it |
|---|---|---|---|
| Market context | is this market important, is demand real and growing | add (GAP 03) | one "Market" line on the opportunity, with source |
| User behaviour | are people actually asking this at the decision point | add (GAP 02) | "Users" line, real prompts vs tracked |
| Contextual competitor | is this the relevant rival, why are they winning | elevate | "Competitor" line, molecule × indication × stage × audience |
| Business outcome | what would fixing this move | add (GAP 05) | "Business" line, the decision-path outcome, with the boundary |
| Signal relationship | citation up but recommendation flat, what does that mean | add (GAP 01) | one "why" sentence connecting the metrics to the leakage |

### Stage 4 — what to do

| Metric | Question it answers | Call | How to show it |
|---|---|---|---|
| Actions / recommendations | what next | keep | "What to do", with the ranking evidence for why this first |
| Owner / agent / approval | who does it | keep, collapsed | execution detail, not a decision |

### Stage 5 — did it move

| Metric | Question it answers | Call | How to show it |
|---|---|---|---|
| Lift (visibility / citation / recommendation) | did the GEO move | keep | "The result so far", with the honest boundary |
| No-impact review | what didn't move, learn | keep | "what didn't move" |
| Environment change | real change, or model / refresh noise | add (GAP 06) | a measurement note separating brand change from platform change |

## The presentation principle

One rule, from the master question: a number only earns screen space if it is evidence for a decision question. The screen is the chain:

1. What to do
2. Why it matters
3. The result so far

"Why it matters" is the centerpiece. The opportunity is not a number. It is a claim backed by four labeled context layers (market, users, competitor, business), each carrying its source. That is what turns "42% visibility" into "a high-priority decision point for this molecule in India."

## What this changed in the build

| Before | After |
|---|---|
| Share of Voice shown as a KPI | removed, redundant |
| Brand Accuracy in the health score | moved to risk, health now measures GEO performance only |
| metrics shown as a flat dashboard | metrics shown as evidence for the three questions |
| 13 evidence sections on screen | collapsed behind the agent |
| no signal relationship | a "why" line: cited more, not recommended more |

## What's next

The current build is one static view. The next step is role-dynamic: each role sees only the database, metrics, and decision they need. An executive sees the decision and the boundary. A content operator sees the content gaps. A medical reviewer sees the risk queue. The agent already selects by role; the screen will follow.
