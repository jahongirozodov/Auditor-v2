/* Idempotent seed — upserts every fixture row so DB == fixtures. Run: npm run db:seed */
import { AuditProjectStatus, PrismaClient } from "@prisma/client";
import {
  AUDITS,
  FINDINGS,
  KPI_RULES,
  KPI_USERS,
  ORGS,
  ORG_DETAIL,
  REPORTS,
  TASKS,
  TOKENS,
  USERS,
} from "../src/lib/fixtures";
import { DEMO_HASH, EMAILS } from "../src/lib/auth/demo";

const prisma = new PrismaClient();

// Plain-JSON clone (typed any) for Prisma Json columns.
const json = (v: unknown) => JSON.parse(JSON.stringify(v));

function projectStateForAudit(
  status: string,
  hasProjectContent: boolean,
): { status: AuditProjectStatus; currentApprovalStage: string | null } | null {
  if (status === "group_forming" || (!hasProjectContent && status === "planning")) return null;
  if (status === "project_pending") {
    return { status: AuditProjectStatus.submitted, currentApprovalStage: "head" };
  }
  if (status === "returned")
    return { status: AuditProjectStatus.returned, currentApprovalStage: null };
  if (status === "project_draft" || status === "planning") {
    return { status: AuditProjectStatus.draft, currentApprovalStage: null };
  }
  return { status: AuditProjectStatus.approved, currentApprovalStage: null };
}

async function main() {
  // Purge non-fixture create-spec rows so the DB converges to the fixtures — removes audits/tasks/
  // findings (and their dependents) created by E2E/dev runs whose afterAll cleanup was skipped,
  // which would otherwise drift the create flows' deterministic ids (AUD-2026-016, T-126, …).
  // Fixture-task history + audit logs are left intact (they don't drive id generation).
  const auditIds = AUDITS.map((a) => a.id);
  const taskIds = TASKS.map((t) => t.id);
  const findingIds = FINDINGS.map((f) => f.id);
  // Config-analysis rows are never fixtures — drop all (FK order: results → devices → uploads)
  // before audit/task purge, since uploads reference an audit + task.
  await prisma.aiAnalysisResult.deleteMany({});
  await prisma.analyzedDevice.deleteMany({});
  await prisma.configUpload.deleteMany({});
  // System settings reset to defaults each seed (not fixtures) — keeps /settings deterministic.
  await prisma.systemSetting.deleteMany({});
  // Drop tokens issued at runtime (E2E/dev) so /tokens converges to the fixtures.
  await prisma.auditToken.deleteMany({ where: { id: { notIn: TOKENS.map((t) => t.id) } } });
  await prisma.taskStatusHistory.deleteMany({ where: { taskId: { notIn: taskIds } } });
  await prisma.finding.deleteMany({ where: { id: { notIn: findingIds } } });
  await prisma.task.deleteMany({ where: { id: { notIn: taskIds } } });
  await prisma.auditMember.deleteMany({ where: { auditId: { notIn: auditIds } } });
  await prisma.audit.deleteMany({ where: { id: { notIn: auditIds } } });

  // Users
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        role: u.role,
        title: u.title,
        avatar: u.avatar,
        dept: u.dept,
        email: EMAILS[u.id],
        passwordHash: DEMO_HASH,
      },
      create: {
        id: u.id,
        name: u.name,
        role: u.role,
        title: u.title,
        avatar: u.avatar,
        dept: u.dept,
        email: EMAILS[u.id],
        passwordHash: DEMO_HASH,
      },
    });
  }

  // Organizations (+ detail folded in, + contacts/devices)
  for (const o of ORGS) {
    const d = ORG_DETAIL[o.id];
    const base = {
      name: o.name,
      stir: o.stir,
      sector: o.sector,
      audits: o.audits,
      contact: o.contact,
      head: d.head,
    };
    await prisma.organization.upsert({
      where: { id: o.id },
      update: base,
      create: { id: o.id, ...base },
    });
    await prisma.orgContact.deleteMany({ where: { orgId: o.id } });
    await prisma.orgContact.createMany({
      data: d.contacts.map((c) => ({ orgId: o.id, ...c })),
    });
    await prisma.orgDevice.deleteMany({ where: { orgId: o.id } });
    await prisma.orgDevice.createMany({
      data: d.devices.map((dv) => ({ orgId: o.id, ...dv })),
    });
  }

  // Sectors
  const SEED_SECTORS = [
    "Davlat",
    "Moliya va bank",
    "Energetika",
    "Telekommunikatsiya",
    "Sogʻliqni saqlash",
    "Taʼlim",
    "Transport",
    "Sanoat",
  ];
  for (const name of SEED_SECTORS) {
    await prisma.sector.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Audits (+ members)
  for (const a of AUDITS) {
    const base = {
      code: a.code,
      title: a.title,
      orgId: a.org,
      type: a.type,
      status: a.status,
      stage: a.stage,
      startDate: a.startDate,
      endDate: a.endDate,
      progress: a.progress,
      leaderId: a.leader,
      lastSync: a.lastSync,
      pinned: a.pinned ?? false,
      projectStage: a.status === "project_pending" ? "head" : null,
      goal: a.goal ?? null,
      methodology: a.methodology ?? null,
      scope: a.scope,
      tools: a.tools,
      findings: json(a.findings),
      tasksAgg: json(a.tasks),
    };
    await prisma.audit.upsert({
      where: { id: a.id },
      update: base,
      create: { id: a.id, ...base },
    });
    await prisma.auditMember.deleteMany({ where: { auditId: a.id } });
    await prisma.auditMember.createMany({
      data: a.members.map((userId) => ({ auditId: a.id, userId })),
      skipDuplicates: true,
    });
  }

  // AuditProject is the docs-aligned aggregate. Backfill it from the legacy audit fields kept for
  // migration compatibility, and move project approvals to the dedicated immutable timeline.
  await prisma.approvalEvent.deleteMany({ where: { entityType: "project" } });
  await prisma.auditProjectApproval.deleteMany({});
  for (const a of AUDITS) {
    const hasProjectContent = !!(
      a.goal ||
      a.methodology ||
      a.scope.length > 0 ||
      a.tools.length > 0
    );
    const state = projectStateForAudit(a.status, hasProjectContent);
    if (!state) {
      await prisma.auditProject.deleteMany({ where: { auditId: a.id } });
      continue;
    }
    const project = await prisma.auditProject.upsert({
      where: { auditId: a.id },
      update: {
        status: state.status,
        currentApprovalStage: state.currentApprovalStage,
        goal: a.goal ?? null,
        methodology: a.methodology ?? null,
        scope: a.scope,
        tools: a.tools,
      },
      create: {
        auditId: a.id,
        status: state.status,
        currentApprovalStage: state.currentApprovalStage,
        goal: a.goal ?? null,
        methodology: a.methodology ?? null,
        scope: a.scope,
        tools: a.tools,
      },
    });
    if (a.status === "project_pending") {
      await prisma.auditProjectApproval.create({
        data: {
          projectId: project.id,
          actorId: a.leader,
          action: "Submit",
          stage: "group_lead",
          state: "done",
        },
      });
    }
  }

  // Tasks
  for (const t of TASKS) {
    const base = {
      auditId: t.auditId,
      title: t.title,
      type: t.type,
      priority: t.priority,
      status: t.status,
      due: t.due,
      assigneeId: t.assignee,
      findings: t.findings,
      files: t.files,
      kpi: t.kpi,
    };
    await prisma.task.upsert({ where: { id: t.id }, update: base, create: { id: t.id, ...base } });
  }

  // Findings
  // A few findings are marked as having arrived from the desktop agent (non-null
  // idempotencyKey) so the /agent "synced findings" section + E2E have data.
  const AGENT_SYNCED = new Set(FINDINGS.slice(0, 4).map((f) => f.id));
  for (const f of FINDINGS) {
    const base = {
      auditId: f.auditId,
      taskId: f.taskId,
      title: f.title,
      severity: f.severity,
      cvss: f.cvss,
      status: f.status,
      reportedById: f.reportedBy,
      date: f.date,
      asset: f.asset,
      type: f.type,
      cwe: f.cwe,
      description: f.description,
      evidence: f.evidence,
      ai: f.ai,
      approvalStage: f.status === "review" ? "group_lead" : null,
      idempotencyKey: AGENT_SYNCED.has(f.id) ? `seed-agent-${f.id}` : null,
    };
    await prisma.finding.upsert({
      where: { id: f.id },
      update: base,
      create: { id: f.id, ...base },
    });
  }

  // Approval trail — seed a "Submit" event for findings already in/through review
  // so the drawer timeline isn't empty. Idempotent (clear + recreate).
  await prisma.approvalEvent.deleteMany({ where: { entityType: "finding" } });
  for (const f of FINDINGS) {
    if (f.status === "review" || f.status === "returned" || f.status === "approved") {
      await prisma.approvalEvent.create({
        data: {
          entityType: "finding",
          entityId: f.id,
          who: f.reportedBy,
          action: "Submit",
          stage: "group_lead",
          state: "done",
        },
      });
    }
  }

  // KPI
  for (const k of KPI_USERS) {
    const base = {
      audits: k.audits,
      tasks: k.tasks,
      findings: k.findings,
      total: k.total,
      delta: k.delta,
      sparkline: json(k.sparkline),
    };
    await prisma.kpiUser.upsert({
      where: { userId: k.user },
      update: base,
      create: { userId: k.user, ...base },
    });
  }

  // KPI rules (19 scoring rules; displayed on /kpi and drive emitKpiEvent)
  for (const r of KPI_RULES) {
    const base = { label: r.label, points: r.points, active: true };
    await prisma.kpiRule.upsert({
      where: { code: r.code },
      update: base,
      create: { code: r.code, ...base },
    });
  }

  // Tokens
  // Active tokens get a future expiry relative to seed time so the desktop agent can
  // actually validate + sync after a fresh seed (the prototype fixtures carry a fixed
  // past date — an "active" token whose expiry is in the past is rejected at validate).
  // Expired/revoked tokens keep their past fixture dates for display fidelity.
  const futureStamp = (days: number) =>
    new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 16).replace("T", " ");
  for (const tk of TOKENS) {
    const base = {
      auditId: tk.audit,
      userId: tk.user,
      device: tk.device,
      hostname: tk.hostname,
      os: tk.os,
      agent: tk.agent,
      ip: tk.ip,
      issued: tk.issued,
      expires: tk.status === "active" ? futureStamp(60) : tk.expires,
      status: tk.status,
      lastUsed: tk.lastUsed,
      tasks: tk.tasks,
    };
    await prisma.auditToken.upsert({
      where: { id: tk.id },
      update: base,
      create: { id: tk.id, ...base },
    });
  }

  // Reports
  for (const r of REPORTS) {
    const base = {
      auditId: r.audit,
      title: r.title,
      type: r.type,
      status: r.status,
      generated: r.generated,
      size: r.size,
      format: json(r.format),
      authorId: r.author,
    };
    await prisma.report.upsert({
      where: { id: r.id },
      update: base,
      create: { id: r.id, ...base },
    });
  }

  // Desktop agent — published build metadata (version endpoint returns the latest).
  await prisma.desktopAgentVersion.upsert({
    where: { version: "1.0.0" },
    update: {},
    create: { version: "1.0.0", notes: "Walking-skeleton release" },
  });

  // Agent monitoring data for /agent (sync history + token-usage feed). Never fixtures —
  // reset each seed. Timestamps are relative to "now" so the dashboard always shows recent
  // activity (a monitoring screen is inherently time-relative; E2E asserts presence, not counts).
  const ago = (mins: number) => new Date(Date.now() - mins * 60_000);
  await prisma.agentSyncSession.deleteMany({});
  await prisma.auditTokenUsageLog.deleteMany({});
  const SYNCS = [
    {
      id: "asy_seed_1",
      tokenId: "tk_a91x...c47e",
      auditId: "AUD-2026-014",
      userId: "u6",
      status: "completed",
      findingCount: 3,
      startedAt: ago(35),
      completedAt: ago(34),
    },
    {
      id: "asy_seed_2",
      tokenId: "tk_c63m...d92b",
      auditId: "AUD-2026-014",
      userId: "u4",
      status: "completed",
      findingCount: 1,
      startedAt: ago(180),
      completedAt: ago(179),
    },
    {
      id: "asy_seed_3",
      tokenId: "tk_b27p...f10a",
      auditId: "AUD-2026-014",
      userId: "u7",
      status: "failed",
      findingCount: 0,
      startedAt: ago(540),
      completedAt: ago(539),
    },
    {
      id: "asy_seed_4",
      tokenId: "tk_d04q...e83c",
      auditId: "AUD-2026-014",
      userId: "u3",
      status: "completed",
      findingCount: 2,
      startedAt: ago(1560),
      completedAt: ago(1559),
    },
  ];
  for (const s of SYNCS) {
    await prisma.agentSyncSession.create({ data: s });
  }
  await prisma.auditTokenUsageLog.createMany({
    data: [
      {
        tokenId: "tk_a91x...c47e",
        action: "validate",
        status: "ok",
        ip: "10.10.40.21",
        createdAt: ago(36),
      },
      {
        tokenId: "tk_a91x...c47e",
        action: "my_tasks",
        status: "ok",
        ip: "10.10.40.21",
        createdAt: ago(35),
      },
      {
        tokenId: "tk_a91x...c47e",
        action: "sync.complete",
        status: "completed",
        ip: "10.10.40.21",
        createdAt: ago(34),
      },
      {
        tokenId: "tk_c63m...d92b",
        action: "sync.complete",
        status: "completed",
        ip: "10.10.40.24",
        createdAt: ago(179),
      },
      {
        tokenId: "tk_b27p...f10a",
        action: "sync.complete",
        status: "failed",
        ip: "10.10.40.27",
        createdAt: ago(539),
      },
      {
        tokenId: "tk_e88r...a15d",
        action: "validate",
        status: "expired",
        ip: "10.10.99.9",
        createdAt: ago(120),
      },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    orgs: await prisma.organization.count(),
    audits: await prisma.audit.count(),
    tasks: await prisma.task.count(),
    findings: await prisma.finding.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
