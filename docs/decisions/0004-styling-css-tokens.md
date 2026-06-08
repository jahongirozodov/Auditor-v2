# ADR-0004 — Styling: vendored CSS tokens, no Tailwind

- **Status:** Accepted
- **Date:** 2026-06-08

## Context

The prototype ships a complete design-token system (`tokens/*.css`) plus prebuilt component classes
(`.btn`, `.panel`, `.stat`, `.sev`, `.tag`, …) and a cinematic layer (`wow.css`, `kit-extra.css`). The
design system also defines a token-adherence lint contract (no raw hex/px, three approved fonts).

## Decision

Use the **vendored design-system CSS as-is** (copied verbatim into `web/src/styles/`), imported once via
`globals.css`. **No Tailwind.** Style only via semantic tokens (`var(--bg-surface)`, `var(--space-4)`,
`var(--font-display)`) and the existing classes. Fonts are self-hosted via `next/font`. Light/dark via
`data-theme` (default dark).

Token adherence is enforced as **ESLint warnings** (raw hex, off-system fonts) — see
[../../web/eslint.config.mjs](../../web/eslint.config.mjs).

## Consequences

- Near-pixel-faithful migration with minimal restyling; the design stays the source of truth.
- `web/src/styles/**` is treated as **vendored** — not reformatted (Prettier/ESLint ignore it) and not
  hand-edited; new styles extend it or use CSS Modules built on tokens.
- No utility-class layer; contributors must learn the token/class vocabulary (documented in
  [../01-architecture.md](../01-architecture.md) and the handoff
  [agent-rules/01-ui-and-styling.md](../../project/design_handoff_auditor/agent-rules/01-ui-and-styling.md)).

## Open questions

- None. Revisit only if the team later wants a utility-first layer mapped onto the tokens.
