/* Idempotent seed — upserts every fixture row so DB == fixtures. Run: npm run db:seed */
import { PrismaClient } from "@prisma/client";
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
      region: d.region,
      address: d.address,
      risk: d.risk,
      head: d.head,
      since: d.since,
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

  // Project approval trail — for audits in project_pending, seed the group_lead
  // "Submit" event (so the strip shows submitted → awaiting head). Idempotent.
  await prisma.approvalEvent.deleteMany({ where: { entityType: "project" } });
  for (const a of AUDITS) {
    if (a.status === "project_pending") {
      await prisma.approvalEvent.create({
        data: {
          entityType: "project",
          entityId: a.id,
          who: a.leader,
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
      expires: tk.expires,
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
