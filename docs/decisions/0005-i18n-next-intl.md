# ADR-0005 — i18n: next-intl, Uzbek default

- **Status:** Accepted
- **Date:** 2026-06-08

## Context

The UI is **Uzbek (Latin)**; the TZ also reserves **ru** and **en** (`LocalizedText` JSONB, default
neutral `uz`). All prototype strings are hardcoded inline. We need translation infrastructure in place
from the start so screens are built i18n-ready, not retrofitted.

## Decision

Use **`next-intl`** in **no-i18n-routing** mode: the active locale is read from the `NEXT_LOCALE` cookie
and defaults to `uz`; URLs stay clean (no `/uz` prefix). Message catalogs live in `web/messages/*.json`;
components read strings via `useTranslations()`. Config in
[../../web/src/i18n/](../../web/src/i18n/), plugin wired in `next.config.ts`.

Uzbek-Latin copy rules apply: sentence case, no emoji/exclamations, correct glyphs (`oʻ`, `gʻ`, `ʼ`),
ISO dates, Uzbek relative time, UPPERCASE only for small meta/group labels.

## Consequences

- No hardcoded UI text — everything goes through the catalog.
- ru/en enable later by adding catalogs and listing locales in `src/i18n/config.ts`; switching to
  locale-prefixed routing (if ever needed) won't touch component-level translations.

## Open questions

- When (if) ru/en go live, do we keep cookie-based switching or move to locale-prefixed URLs?
- Source of localized **content** (org names, etc.): mirror the TZ's `LocalizedText` JSONB shape in our
  data layer when the backend lands.
