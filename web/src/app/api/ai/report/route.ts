import { z } from "zod";
import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { gatherAuditReportData } from "@/lib/reports/audit-report-data";
import { buildAuditDocx, REPORT_SECTIONS, type ReportSection } from "@/lib/reports/audit-docx";
import { analyzeAudit } from "@/lib/actions/audit-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const Body = z.object({
  auditId: z.string().min(1),
  sections: z.array(z.enum(REPORT_SECTIONS)).min(1),
});

/**
 * Assemble the selected audit report sections into a real .docx and stream it back
 * as a download. The executive-summary / remediation sections are filled from the
 * stored whole-audit AI analysis; if none exists yet it is generated on demand
 * (best-effort — the report still builds without it).
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session?.user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!(await requirePermission(session.user.id, "report.create")))
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const { auditId, sections } = parsed.data;

  // Ensure AI text is available when an AI section is requested (best-effort).
  const needsAi = sections.includes("exec") || sections.includes("remediation");
  if (needsAi) {
    try {
      await analyzeAudit({ auditId });
    } catch {
      // ignore — report still builds with the "mavjud emas" placeholder
    }
  }

  const data = await gatherAuditReportData(auditId);
  if (!data) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  const buffer = await buildAuditDocx(data, sections as ReportSection[]);
  const filename = `${data.audit.code}-hisobot.docx`;

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": DOCX_MIME,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}
