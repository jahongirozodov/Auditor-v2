# ADR-0006 — Canonical role codes

- **Status:** Accepted
- **Date:** 2026-06-08

## Context

The same 5-level role hierarchy appears under **three different naming schemes** across the sources:

- **TZ (the implemented system):** `super / head / chief / lead / t1`
- **Prototype `data.js` (the UI we build from):** `departament / bolim / bosh / yetakchi / toifa1`
- **Handoff routes doc:** a mix (`departament`, `bosh`, `head`, plus `tahlilchi` for analyst gating)

Building role-gated navigation and RBAC against inconsistent codes would be error-prone.

## Decision

Adopt the **TZ codes as canonical** everywhere in docs and code:
`super` · `head` · `chief` · `lead` · `t1`.

**Mapping (prototype → canonical):**

| Prototype (`data.js`) | Canonical | Uzbek title |
| --- | --- | --- |
| `departament` | `super` | Departament rahbari |
| `bolim` | `head` | Boʻlim boshligʻi |
| `bosh` | `chief` | Bosh mutaxassis |
| `yetakchi` | `lead` | Yetakchi mutaxassis |
| `toifa1` | `t1` | Birinchi toifali mutaxassis |

**Analyst (`tahlilchi`) is NOT a role.** Where the handoff gates a screen to "tahlilchi+", model it as
the analysis **permissions** (`config.upload`, `scanner.import`, `traffic.upload`, `ai.use`) — see
[../02-rbac-and-roles.md](../02-rbac-and-roles.md).

## Consequences

- Prototype data is normalized to canonical codes during the Phase 0.5 fixture port.
- `lib/rbac.ts`, seed data, and UI role checks all use `super/head/chief/lead/t1`.
- Duties (`group_lead` / `auditor`) remain separate from roles, as in the TZ.

## Open questions

- None. Display labels stay Uzbek (via i18n); only the internal codes are standardized.
