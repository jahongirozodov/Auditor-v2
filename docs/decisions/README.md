# Architecture Decision Records (ADRs)

Short, dated records of significant decisions: the context, the choice, and its consequences. They make
the *why* explicit so future work doesn't re-litigate settled questions — or accidentally treat an
**open** question as settled.

## Format

Each ADR has: **Status** (Proposed / Accepted / Open / Superseded), **Context**, **Decision**,
**Consequences**, and **Open questions**. Number files sequentially (`NNNN-title.md`).

## Index

| # | Title | Status |
| --- | --- | --- |
| [0001](0001-frontend-stack.md) | Frontend & overall stack (Next.js full-stack, new TS backend) | Accepted |
| [0002](0002-desktop-agent-scope.md) | EXE desktop agent & analysis-parser scope | **Open** |
| [0003](0003-reporting-export.md) | Report export (PDF/DOCX) library | **Open** |
| [0004](0004-styling-css-tokens.md) | Styling: vendored CSS tokens, no Tailwind | Accepted |
| [0005](0005-i18n-next-intl.md) | i18n: next-intl, Uzbek default | Accepted |
| [0006](0006-role-codes.md) | Canonical role codes: super/head/chief/lead/t1 | Accepted |
| [0007](0007-testing-strategy.md) | Testing strategy + ≥90% design-fidelity gate | Accepted |

> When an open item is resolved, update its ADR's **Status** and the relevant spec doc in [..](../).
