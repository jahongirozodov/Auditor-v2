# ADR-0007 — Testing strategy & design-fidelity gate

- **Status:** Accepted
- **Date:** 2026-06-08

## Context

Standing rule from the owner: every feature ships with **unit + integration + E2E + frontend
(component)** tests, written alongside the code; and the built UI must match the prototype **≥90%**.

## Decision

- **Unit + component:** **Vitest** (jsdom) + **@testing-library/react** + jest-dom. Tests live next to
  the code as `*.test.ts[x]`. Config: `web/vitest.config.ts`, setup `web/src/test/setup.ts`.
- **Integration:** Vitest for multi-module / Server Actions / Route Handlers; a real test DB
  (Testcontainers/Prisma) joins in Phase 1.
- **E2E + visual regression:** **Playwright** (`web/e2e/`, `web/playwright.config.ts`). Design fidelity
  enforced via `expect(page).toHaveScreenshot()` baselines (`maxDiffPixelRatio: 0.1`), cross-checked
  against `project/app/screenshots/` and the live prototype.
- Codified as the **Definition of Done** in [../../AGENTS.md](../../AGENTS.md); strategy table in
  [../../DEVELOPMENT-PLAN.md](../../DEVELOPMENT-PLAN.md).

## Consequences

- No feature is "done" until its test layers pass and it's visually checked.
- Scripts: `npm run test` (unit + component), `npm run test:e2e` / `test:e2e:update` (E2E + snapshots).
- Closed-network note: Playwright browsers must be vendored for air-gapped CI (see
  [ADR-0002](0002-desktop-agent-scope.md) deployment follow-ups).

## Open questions

- CI runner (GitHub Actions vs. on-prem) — affects where browsers/baselines are cached.
