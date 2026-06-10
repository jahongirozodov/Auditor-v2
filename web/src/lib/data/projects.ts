import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AuditProject, AuditProjectStatus, ApprovalStageKey } from "@/lib/types/entities";

type ProjectRow = {
  id: string;
  auditId: string;
  status: string;
  currentApprovalStage: string | null;
  goal: string | null;
  methodology: string | null;
  scope: string[];
  tools: string[];
};

function toProject(p: ProjectRow): AuditProject {
  return {
    id: p.id,
    auditId: p.auditId,
    status: p.status as AuditProjectStatus,
    currentApprovalStage: p.currentApprovalStage as ApprovalStageKey | null,
    goal: p.goal,
    methodology: p.methodology,
    scope: p.scope,
    tools: p.tools,
  };
}

export const getAuditProject = cache(async (auditId: string): Promise<AuditProject | null> => {
  const p = await prisma.auditProject.findUnique({ where: { auditId } });
  return p ? toProject(p) : null;
});
