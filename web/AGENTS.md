<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# web/ — Auditor app

The production Next.js app. Read the repo-level [../AGENTS.md](../AGENTS.md) and
[../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md) first. This file covers conventions specific to the app.

## Stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript (strict) · `next-intl` · vendored CSS design
system (no Tailwind) · `next/font` (self-hosted) · Prisma 5 + PostgreSQL · Auth.js · Ollama proxy
(local, optional).

## Layout

```
src/app/            # routes, root layout, fonts.ts, globals.css
src/components/      # ui/ (primitives) · chrome/ (sidebar, topbar) · feature components
src/i18n/           # config.ts (locales) · request.ts (next-intl resolver, reads NEXT_LOCALE cookie)
src/styles/         # VENDORED design system — tokens/*, app.css, kit-extra.css, wow.css
messages/           # i18n catalogs (uz.json)
```

## Conventions

- **Styling = tokens + existing classes.** Use semantic CSS variables (`var(--bg-surface)`,
  `var(--space-4)`, `var(--font-display)`) and the prebuilt classes in `app.css`/`kit-extra.css`.
  Don't restyle `src/styles/**` — it's vendored verbatim from the design source (Prettier/ESLint
  ignore it). New component CSS: prefer extending classes or CSS Modules built on tokens.
- **Theming:** never read system color-scheme directly; rely on `data-theme` + semantic aliases.
  The no-flash bootstrap lives in `layout.tsx`; theme is read via `useSyncExternalStore`
  (`components/ThemeToggle.tsx`) — **do not** `setState` inside an effect (ESLint blocks it).
- **i18n:** add strings to `messages/uz.json` and read with `useTranslations("namespace")`. Server and
  client components can both use it. Keep Uzbek-Latin copy rules (sentence case, correct glyphs).
- **Prototype → component:** translate `screens-*.jsx`/`chrome.jsx` (which use `h(...)`/`React.createElement`)
  into clean JSX. Fixtures live in `src/lib/fixtures/`; Prisma seed is in `prisma/seed.ts`. Map
  `icons.jsx` → `lucide-react`.
- **Server-first:** fetch in Server Components; mutate via Server Actions; `"use client"` only when
  needed. Re-check RBAC on the server for every mutation.

## Before you finish

```bash
npm run build && npm run lint && npm run typecheck   # all must pass
npm run format                                        # apply Prettier
```

