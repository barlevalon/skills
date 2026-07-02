---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through the selected candidate using domain language and ADR context.
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

This skill composes three reusable disciplines:

- **codebase-design** — shared vocabulary for modules, interfaces, seams, adapters, depth, leverage, and locality.
- **domain-modeling** — use `CONTEXT.md` and ADRs as the project's language and decision memory.
- **grilling** — after candidate selection, interview the user one question at a time until the design is concrete.

If those skills are available, apply them. If not, use the glossary and process below directly.

## Architecture vocabulary

Use these terms exactly in every suggestion. Do not drift into "component," "service," "API," or "boundary." Full reusable discipline lives in the `codebase-design` skill.

- **Module** — anything with an interface and an implementation.
- **Interface** — everything a caller must know to use the module correctly: types, invariants, ordering constraints, error modes, required configuration, and performance characteristics.
- **Implementation** — what is inside a module.
- **Depth** — leverage at the interface: a lot of behaviour behind a small interface.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place.
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth: more capability per unit of interface learned.
- **Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrated in one place.

Key principles:

- **Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across callers, it was earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**

## Process

### 1. Explore

Read the project's domain glossary and relevant decisions first:

- `CONTEXT-MAP.md`, if present
- root or context-local `CONTEXT.md`
- relevant ADRs under `docs/adr/`

Then explore the codebase. Use subagents where available for broad scouting; otherwise inspect directly. Do not follow rigid heuristics — note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as implementation?
- Where have pure functions been extracted only for testability, but the real bugs hide in how they are called?
- Where do tightly-coupled modules leak across seams?
- Which parts are untested, or hard to test through their current interface?

Apply the **deletion test** to suspected shallow modules.

### 2. Classify dependencies

For each candidate, classify dependencies using the codebase-design deepening categories:

- **In-process** — pure computation or in-memory state. Deepen directly; no adapter needed.
- **Local-substitutable** — dependencies with local test stand-ins, such as in-memory filesystem or PGLite. Test with the stand-in; keep seam internal.
- **Remote but owned** — owned network services. Define a port at the seam; production adapter uses HTTP/gRPC/queue, tests use in-memory adapter.
- **True external** — third-party services. Inject a port and use mock adapter in tests.

Do not introduce a port unless at least two adapters are justified.

### 3. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo:

- Resolve temp dir from `$TMPDIR`; fall back to `/tmp` on Unix or `%TEMP%` on Windows.
- Write to `<tmpdir>/architecture-review-<timestamp>.html`.
- Open it for the user: `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows.
- Tell the user the absolute path.

Use Tailwind CDN for layout and Mermaid CDN for graph-shaped diagrams. Mix Mermaid with hand-crafted CSS/SVG when that better communicates depth, seam leakage, or module mass. See [HTML-REPORT.md](HTML-REPORT.md) for scaffold and diagram patterns.

For each candidate, render a card with:

- **Files** — involved files/modules
- **Problem** — why current architecture creates friction
- **Solution** — plain English description of what changes
- **Benefits** — locality, leverage, and test impact
- **Before / After diagram** — side-by-side visualisation
- **Recommendation strength** — `Strong`, `Worth exploring`, or `Speculative`
- **Dependency category** — one of the categories above

Use `CONTEXT.md` vocabulary for the domain and codebase-design vocabulary for architecture. If `CONTEXT.md` defines "Order," say "Order intake module," not a raw class/file name unless the file itself is the point.

**ADR conflicts**: if a candidate contradicts an ADR, surface it only when friction is real enough to warrant revisiting the ADR. Mark it clearly. Do not list every theoretical refactor an ADR forbids.

End the report with **Top recommendation**: which candidate to tackle first and why.

Do **not** propose interfaces yet. After opening the report, ask:

> Which of these would you like to explore?

### 4. Grill the selected candidate

Once the user chooses, apply the grilling loop:

- Ask one question at a time.
- Provide your recommended answer with each question.
- Resolve constraints, dependencies, seam placement, what sits behind the seam, and which tests survive.
- If a question can be answered by exploring code, inspect code instead of asking.

Maintain the domain model inline:

- Naming a deepened module after a concept not in `CONTEXT.md`? Add the term.
- Sharpening a fuzzy term? Update `CONTEXT.md` immediately.
- Rejecting a candidate for a load-bearing reason? Offer an ADR only if future agents need the reason to avoid re-suggesting it.

If the user wants to explore alternative interfaces for the deepened module, use the codebase-design **Design It Twice** pattern: generate multiple radically different interfaces, compare by depth, locality, and seam placement, then recommend one.
