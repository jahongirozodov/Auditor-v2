import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { AuditReportData } from "./audit-report-data";

/** Report section keys, in print order — mirror the AiScreen report-builder checkboxes. */
export const REPORT_SECTIONS = [
  "overview",
  "group",
  "findings",
  "exec",
  "remediation",
  "topology",
  "kpi",
  "appendix",
] as const;

export type ReportSection = (typeof REPORT_SECTIONS)[number];

const SECTION_TITLES: Record<ReportSection, string> = {
  overview: "Audit umumiy maʼlumotlari",
  group: "Audit guruhi va vazifalar",
  findings: "Tasdiqlangan findinglar",
  exec: "Executive summary",
  remediation: "Remediation plan",
  topology: "Tarmoq xaritasi",
  kpi: "KPI hisoboti",
  appendix: "Ilovalar (dalillar)",
};

const STATUS_UZ: Record<string, string> = {
  planning: "Rejalashtirish",
  group_forming: "Guruh shakllantirish",
  project_draft: "Loyiha qoralama",
  project_pending: "Loyiha tasdiqda",
  head_approved: "Qisman tasdiqlangan",
  assigning: "Vazifa taqsimlash",
  in_progress: "Jarayonda",
  review: "Koʻrib chiqilmoqda",
  returned: "Qaytarilgan",
  approved: "Tasdiqlangan",
  completed: "Yakunlangan",
  cancelled: "Bekor qilingan",
};

function heading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });
}

function para(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 80 } });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun(text)],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

function kvTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 32, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })],
            }),
            new TableCell({ children: [new Paragraph(v)] }),
          ],
        }),
    ),
  });
}

function sectionChildren(
  section: ReportSection,
  d: AuditReportData,
): Paragraph[] | (Paragraph | Table)[] {
  switch (section) {
    case "overview": {
      const f = d.audit.findings;
      return [
        kvTable([
          ["Kod", d.audit.code],
          ["Nomi", d.audit.title],
          ["Tashkilot", d.audit.org],
          ["Turi", d.audit.type],
          ["Holati", STATUS_UZ[d.audit.status] ?? d.audit.status],
          ["Bosqich", `${d.audit.stage}/10`],
          ["Muddat", `${d.audit.startDate} — ${d.audit.endDate}`],
          ["Rahbar", d.audit.leader],
          [
            "Findinglar",
            `${f.critical} critical, ${f.high} high, ${f.medium} medium, ${f.low} low`,
          ],
        ]),
      ];
    }
    case "group": {
      const out: Paragraph[] = [];
      out.push(para(`Vazifalar: ${d.audit.tasks.done}/${d.audit.tasks.total} bajarilgan.`));
      out.push(para("Audit guruhi:"));
      if (d.members.length === 0) out.push(bullet("Aʼzolar kiritilmagan."));
      for (const m of d.members) out.push(bullet(`${m.name}${m.title ? ` — ${m.title}` : ""}`));
      return out;
    }
    case "findings": {
      if (d.findings.length === 0) return [para("Tasdiqlangan finding yoʻq.")];
      return d.findings.map((f) =>
        bullet(
          `[${f.severity}] ${f.title}${f.asset ? ` — ${f.asset}` : ""}${f.cwe ? ` (${f.cwe})` : ""}`,
        ),
      );
    }
    case "exec": {
      if (!d.ai?.executiveSummary) return [para("Executive summary hozircha mavjud emas.")];
      const out: Paragraph[] = [
        para(`Umumiy xavf: ${d.ai.overallRisk}.`),
        para(d.ai.executiveSummary),
      ];
      return out;
    }
    case "remediation": {
      const plan = d.ai?.remediationPlan ?? [];
      if (plan.length === 0) return [para("Remediation reja hozircha mavjud emas.")];
      return plan.map((r) => bullet(`[${r.priority}] ${r.action}`));
    }
    case "topology": {
      if (!d.topology?.summary) return [para("Topologiya tahlili mavjud emas.")];
      return [para(`Umumiy xavf: ${d.topology.overallRisk}.`), para(d.topology.summary)];
    }
    case "kpi": {
      return [
        kvTable([
          ["Vazifa bajarilishi", `${d.kpi.taskCompletion}%`],
          [
            "Finding hal etilishi",
            `${d.kpi.findingResolution}% (${d.kpi.findingResolved}/${d.kpi.findingTotal})`,
          ],
        ]),
      ];
    }
    case "appendix": {
      if (d.evidence.length === 0) return [para("Dalil fayllari biriktirilmagan.")];
      return d.evidence.map((e) => bullet(`${e.name}${e.comment ? ` — ${e.comment}` : ""}`));
    }
  }
}

/**
 * Build an audit report .docx from the gathered data and the chosen sections,
 * preserving the canonical {@link REPORT_SECTIONS} order. Returns the file bytes.
 */
export async function buildAuditDocx(
  data: AuditReportData,
  sections: ReportSection[],
): Promise<Buffer> {
  const wanted = new Set(sections);
  const ordered = REPORT_SECTIONS.filter((s) => wanted.has(s));

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: data.audit.title, bold: true })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `${data.audit.code} · ${data.audit.org}`, color: "666666" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ];

  for (const s of ordered) {
    children.push(heading(SECTION_TITLES[s]));
    children.push(...sectionChildren(s, data));
  }

  const doc = new Document({
    creator: "Auditor",
    title: `${data.audit.code} hisobot`,
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}
