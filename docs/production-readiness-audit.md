# Production readiness audit

Date: 2026-06-10  
Scope: `web/` Next.js app, Prisma schema, server actions, route handlers, E2E setup, and repo docs.

## Verification snapshot

Commands run from `web/`:

| Check | Result | Notes |
| --- | --- | --- |
| `npm.cmd run typecheck` | Passed | `tsc --noEmit` exited 0. |
| `npm.cmd run lint` | Passed | ESLint exited 0. |
| `npm.cmd run test` | Passed | 114 test files, 691 tests passed. |
| `npm.cmd run build` | Passed with warning | Next build completed, but Turbopack reported an NFT tracing warning for `api/v1/agent/download`. |
| `npm.cmd run test:e2e` | Failed | 50 passed, 2 failed, 1 skipped, 1 did not run. |

The project is in active development and has a large dirty working tree. This audit treats existing
changes as in-progress work and does not assume they are ready to ship.

## Release blockers

### P0-1. E2E release gate is red

Evidence:
- `npm.cmd run test:e2e` failed.
- `e2e/config.spec.ts:51` expects the scanner tab to show the old "keyingi bosqichda tayyor" placeholder after navigating to `/analysis/scanner`; the screen is now implemented, so the test is stale or the expected readiness signal is wrong.
- `e2e/creates.spec.ts:76` expected navigation to `/audits/AUD-2026-016`, but the page stayed on `/audits`.
- Playwright global setup runs `npx prisma db push --skip-generate --accept-data-loss` and reseeds (`web/e2e/global-setup.ts:7-8`), so failures can also be state-coupled.

Production impact:
- The documented Definition of Done requires E2E and visual checks to pass.
- Create-audit/project submission is a core workflow; a red E2E there blocks release confidence.

Recommendation:
- Update stale E2E expectations for implemented scanner/traffic screens.
- Make create-audit E2E assert the created row by visible code returned from the UI/DB instead of a hard-coded next code.
- Split destructive DB setup from production-like E2E, and make E2E state deterministic per test.

### P0-2. Evidence download lacks audit-scoped authorization

Evidence:
- `web/src/app/api/evidence/[id]/route.ts:7` says "any signed-in user may download."
- The handler only checks `getSession()` (`route.ts:9`) and then reads `auditEvidence.findUnique` by id (`route.ts:13`).
- There is no audit membership, owner, leader, RBAC, or RLS check before returning file bytes.

Production impact:
- A signed-in user who can guess or obtain an evidence id can download another audit's evidence.
- Evidence files can contain sensitive screenshots, configs, traffic excerpts, credentials, or exploit details.

Recommendation:
- Join `AuditEvidence -> Audit` and require `canManageEvidence(auditId, userId, role)` or equivalent read permission.
- Add a `FileAccessLog`/`AuditLog` row for every download.
- Add route tests for non-member 403, member 200, admin 200.

### P0-3. PostgreSQL RLS is required but not implemented in schema/migrations

Evidence:
- Docs require DB-level RLS: `docs/03-domain-model.md:80`, `docs/08-security.md:20-23`.
- `web/prisma/schema.prisma` contains indexes and relations, but no RLS policy DDL or migrations.
- E2E setup uses `prisma db push --accept-data-loss` (`web/e2e/global-setup.ts:7`) instead of migration-driven schema setup.

Production impact:
- The app currently relies on application checks only for tenant/audit isolation.
- A missed server-side guard becomes a direct data isolation failure.
- `db push --accept-data-loss` is not a production migration strategy.

Recommendation:
- Add real Prisma migrations plus SQL migrations for `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and policies.
- Define the scoping model explicitly: organization, audit team, or both.
- Add integration tests that prove cross-tenant reads/writes fail at the DB layer.

### P0-4. Production authentication requirements are deferred

Evidence:
- `web/src/lib/auth/users.ts:11-12` marks LDAP/AD bind and TOTP as a later seam.
- `web/prisma/schema.prisma:89` says LDAP/AD + TOTP are deferred, with only reserved columns.
- Login UI still exposes demo guidance (`web/src/app/(auth)/login/LoginForm.tsx:139`).
- Demo password constants exist in code (`web/src/lib/auth/demo.ts:4-9`).

Production impact:
- The system does not yet meet the documented AD/LDAP, domain certificate, and TOTP requirements.
- Demo credentials in production UX/code create operational risk, even if secrets are not committed.

Recommendation:
- Gate demo auth and demo copy behind an explicit non-production flag.
- Implement AD/LDAP bind and TOTP enrollment/verification before production.
- Add tests for lockout + TOTP + disabled-user behavior through both web and agent login.

## High-priority issues

### P1-1. Audit log coverage is incomplete for important mutations

Evidence:
- `web/src/lib/actions/users.ts` creates, updates, locks/unlocks, and deletes users without audit log writes (`createUser`, `updateUser`, `toggleUserLock`, `deleteUser`).
- `web/src/lib/actions/reports.ts:19` creates reports without an audit log; `reports.ts:43-46` deletes reports without an audit log.
- Docs require all CRUD/auth actions in `audit_logs` with before/after JSONB (`docs/03-domain-model.md:73`, `docs/08-security.md:26`).

Production impact:
- Admin actions are not fully traceable.
- Hard deletes without audit records make incident review and compliance reporting weaker.

Recommendation:
- Add a shared mutation audit module so CRUD actions cannot forget logging.
- Prefer soft-delete/disable for sensitive entities where historical references matter.
- Add tests asserting audit log rows for every Server Action mutation.

### P1-2. Analysis permissions are collapsed into `config`

Evidence:
- Scanner actions check `canView(role, "config")` (`web/src/lib/actions/scanner.ts:44`, `:136`, `:182`), though the audit action logged is `scanner.import`.
- Traffic actions also check `canView(role, "config")` (`web/src/lib/actions/traffic.ts:39`, `:122`).
- Topology analysis checks `config` too (`web/src/lib/actions/topology.ts:31`).
- Docs define separate permissions: `config.upload`, `scanner.import`, `traffic.upload`, `ai.use`.

Production impact:
- A user allowed to upload config effectively gets scanner, traffic, and topology access.
- The production permission matrix cannot express analyst capabilities precisely.

Recommendation:
- Introduce fine-grained permission resolution for the 45-permission catalog.
- Replace module-level `canView("config")` with action-level permission checks.
- Add negative tests for users with only one analysis permission.

### P1-3. File storage is DB-blob only; MinIO/S3 is deferred

Evidence:
- `web/src/lib/actions/evidence.ts:13` and `:18` explicitly say DB-blob storage and MinIO deferred.
- `web/prisma/schema.prisma:310-318` stores `FileStorage.bytes Bytes?` with provider default `"db"`.
- `.env.example` includes S3/MinIO configuration, but the app does not use it for evidence storage.

Production impact:
- PostgreSQL will grow quickly with screenshots, evidence, configs, scanner files, and traffic artifacts.
- Backups, retention, access logging, and large-file handling become harder.

Recommendation:
- Add a storage adapter with DB provider for tests/dev and S3/MinIO provider for production.
- Keep only metadata, hashes, and storage keys in Postgres.
- Add download authorization and file-access logging at the adapter boundary.

### P1-4. Config analysis is AI-only, but requirements call for deterministic parsers

Evidence:
- `web/src/lib/analysis/config/index.ts:2-7` says detection is AI-driven and exports `analyzeConfigAI`.
- Docs require parsers for Cisco IOS/IOS-XE, Linux SSH/sudoers, Nginx, Apache, and MikroTik (`docs/05-analysis-and-ai.md:9-15`).
- Earlier parser files appear deleted in the working tree.

Production impact:
- When Ollama is unavailable, config analysis loses its core deterministic detection path.
- AI-only parsing is harder to validate, reproduce, and certify for audit evidence.

Recommendation:
- Restore or rebuild deterministic parsers as the first pass.
- Use AI only for enrichment, prioritization, and recommendation text.
- Add golden fixture tests per vendor/config family.

### P1-5. Agent EXE download route causes a production build tracing warning

Evidence:
- `npm.cmd run build` passed but emitted a Turbopack NFT warning.
- Import trace points to `web/src/app/api/v1/agent/download/route.ts`.
- The route computes a path with `path.join(process.cwd(), "..", "agent", "publish", ...)` (`route.ts:15-18`) and streams it with `createReadStream` (`route.ts:38`).

Production impact:
- The deployment artifact may trace more of the project than intended.
- Air-gapped packaging can accidentally include extra files or miss the external EXE.

Recommendation:
- Put published agent binaries under a statically scoped runtime directory, or require `AGENT_EXE_PATH`.
- Avoid `process.cwd()/..` path traversal in traced routes.
- Add a packaging check that proves only expected files are included.

### P1-6. Security headers and closed-network enforcement are minimal

Evidence:
- `web/next.config.ts` only disables `poweredByHeader`.
- `.env.example` says `CLOSED_NETWORK=true` blocks outbound calls, but code-level enforcement was not evident in the app-wide HTTP layer.
- Docs require HTTPS, security headers, anti-CSRF, and closed-network posture (`docs/08-security.md:32-42`).

Production impact:
- Browser hardening is incomplete for a sensitive audit platform.
- Closed-network policy may depend on convention instead of enforceable code.

Recommendation:
- Add `headers()` in Next config for CSP, HSTS in production, X-Content-Type-Options, Referrer-Policy, frame restrictions, and Permissions-Policy.
- Centralize outbound HTTP through approved adapters that check `CLOSED_NETWORK`.
- Document reverse-proxy TLS assumptions and add a production config checklist.

## Medium-priority issues

### P2-1. E2E setup is destructive and not migration-based

Evidence:
- `web/e2e/global-setup.ts:7` uses `prisma db push --accept-data-loss`.
- `package.json#prisma` emitted a deprecation warning during E2E.

Production impact:
- The test harness does not exercise production migrations.
- Accidental use against a shared DB can destroy data.

Recommendation:
- Use a dedicated test database URL and `prisma migrate deploy` or migration reset only in disposable DBs.
- Move Prisma config from deprecated `package.json#prisma` to `prisma.config.ts`.

### P2-2. Some hardcoded UI strings bypass i18n

Evidence:
- Examples found in components include hardcoded placeholders such as `CreateTaskModal.tsx`, `CreateAuditModal.tsx`, `CreateFindingModal.tsx`, and profile/password fields.
- Repo rules require all user-facing text through `next-intl`.

Production impact:
- Localization quality will drift, and ru/en enablement becomes harder later.

Recommendation:
- Add an ESLint rule or test for hardcoded JSX strings/placeholder literals outside tests.
- Move remaining strings into `web/messages/uz.json`.

### P2-3. Data model still mixes fixture-era strings with production enums

Evidence:
- `web/prisma/schema.prisma` has string statuses and labels for several important fields, for example `Task.status String`, `Task.priority String`, `Report.status String`.
- Comments describe the schema as mirroring typed fixtures.

Production impact:
- Invalid states can enter the DB unless every caller validates perfectly.
- Reporting and workflow queries are more fragile.

Recommendation:
- Promote workflow-critical strings to Prisma enums/check constraints.
- Add DB-level constraints for statuses, stages, severities, duties, and approval stage values.

## Recommended production path

1. Make the release gate green: fix E2E failures, remove state-coupled code assumptions, and keep `build/lint/typecheck/test/e2e` green.
2. Close the security blockers: evidence download authorization, RLS policies, production auth, and audit logging coverage.
3. Replace fixture-era persistence and storage decisions: real migrations, enum/check constraints, MinIO/S3 adapter.
4. Harden deployment: security headers, closed-network enforcement, agent binary packaging, health/metrics, and production environment checklist.
5. Reconcile analysis architecture: deterministic parsers first, AI as enrichment.

## Current positive signals

- TypeScript, ESLint, unit, and component tests are green.
- Production build completes.
- Many core workflows already have server actions and tests.
- Agent API walking skeleton exists and is covered by route tests/E2E.
- The app is already mostly server-first and uses `next-intl` for the main catalog.
