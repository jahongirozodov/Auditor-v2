"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/rbac";
import type { RoleCode } from "@/lib/types/roles";

export const REPORT_TYPES = [
  "Audit hisoboti",
  "Executive summary",
  "Remediation plan",
  "Pentest hisoboti",
] as const;

export const REPORT_FORMATS = ["PDF", "DOCX", "HTML"] as const;

export interface GenerateReportInput {
  title: string;
  auditId: string;
  type: string;
  formats: string[];
}

export async function generateReport(input: GenerateReportInput) {
  const { role, userId } = await requireSession();
  if (!canView(role as RoleCode, "report")) throw new Error("Ruxsat yoʻq");
  if (!input.title.trim() || !input.auditId || !input.formats.length)
    return { ok: false, error: "Maydonlar toʻldirilishi shart" };

  const id = `R-${Date.now()}`;
  await prisma.report.create({
    data: {
      id,
      title: input.title,
      auditId: input.auditId,
      type: input.type,
      status: "draft",
      generated: "—",
      size: "—",
      format: input.formats,
      authorId: userId,
    },
  });
  revalidatePath("/reports");
  return { ok: true, id };
}

export async function deleteReport(id: string) {
  const { role } = await requireSession();
  if (!canView(role as RoleCode, "report")) throw new Error("Ruxsat yoʻq");
  await prisma.report.delete({ where: { id } });
  revalidatePath("/reports");
  return { ok: true };
}
