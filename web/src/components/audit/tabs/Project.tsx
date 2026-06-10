"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, Map, Pencil, Wrench } from "lucide-react";
import { ApprovalFlow } from "@/components/approval/ApprovalFlow";
import { EditProjectModal } from "@/components/audit/EditProjectModal";
import { Tag } from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";
import {
  createAuditProject,
  projectApproval as projectApprovalAction,
} from "@/lib/actions/projects";
import { APPROVAL_STAGES, auditProjectCurrentOf } from "@/lib/approval";
import { USERS } from "@/lib/fixtures";
import type { ApprovalView } from "@/lib/data/approval";
import type { Audit, AuditProject } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type ProjectAction = "submit" | "resubmit" | "approve" | "return";
const EDITABLE = ["draft", "returned"];
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

export function Project({
  a,
  project,
  role,
  currentUserId,
  approval,
}: {
  a: Audit;
  project: AuditProject | null;
  role: RoleCode;
  currentUserId: string;
  approval: ApprovalView | null;
}) {
  const t = useTranslations("auditDetail");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const view: ApprovalView = approval ?? {
    stages: APPROVAL_STAGES,
    timeline: [],
    current: project ? auditProjectCurrentOf(project.status, project.currentApprovalStage) : null,
  };
  const canLeadProject = currentUserId === a.leader || role === "super" || role === "head";
  const canCreate = !project && a.status === "group_forming" && canLeadProject;
  const canEdit = !!project && canLeadProject && EDITABLE.includes(project.status);

  function createProject() {
    startTransition(async () => {
      const res = await createAuditProject({ auditId: a.id });
      toast(res.ok ? t("done") : t("failed"), res.ok ? "success" : "danger");
      if (res.ok) router.refresh();
    });
  }

  function run(action: ProjectAction, comment?: string) {
    startTransition(async () => {
      const res = await projectApprovalAction({ auditId: a.id, action, comment });
      toast(res.ok ? t("done") : t("failed"), res.ok ? "success" : "danger");
      if (res.ok) router.refresh();
    });
  }

  if (!project) {
    return (
      <div className="panel">
        <div className="panel__body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileText size={16} style={{ color: "var(--brand)" }} />
          <span className="cell-sub" style={{ flex: 1 }}>
            {t("startDraftHint")}
          </span>
          {canCreate ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={pending}
              onClick={createProject}
            >
              <FileText size={14} />
              <span>{t("createProject")}</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ApprovalFlow
        stages={view.stages}
        timeline={view.timeline}
        current={view.current}
        role={role}
        usersById={usersById}
        canSubmit={canLeadProject}
        pending={pending}
        onApprove={() => run("approve")}
        onReturn={(comment) => run("return", comment)}
        onResubmit={() => run("resubmit")}
        onSubmit={() => run("submit")}
      />
      <div
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 }}
      >
        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Map size={15} />
              <span>{t("detailsTitle")}</span>
            </div>
            {canEdit ? (
              <button
                type="button"
                className="btn btn--ghost btn--xs"
                onClick={() => setEditOpen(true)}
              >
                <Pencil size={13} />
                <span>{t("editProject")}</span>
              </button>
            ) : null}
          </div>
          <div
            className="panel__body"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <div className="field__label">{t("goal")}</div>
              <div className="text-primary">{project.goal ?? t("goalText")}</div>
            </div>
            <div>
              <div className="field__label">{t("scope")}</div>
              <div>
                <Tag tone="outline">{a.type}</Tag>{" "}
                <span className="cell-sub">
                  {a.startDate} → {a.endDate}
                </span>
              </div>
            </div>
            {project.scope.length > 0 ? (
              <div>
                <div className="field__label">{t("scopeTitle")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {project.scope.map((s) => (
                    <Tag key={s} tone="outline">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <div className="field__label">{t("methodology")}</div>
              <div className="text-primary">{project.methodology ?? t("methodologyText")}</div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Wrench size={15} />
              <span>{t("toolsTitle")}</span>
            </div>
          </div>
          <div className="panel__body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {project.tools.map((x) => (
              <Tag key={x} tone="ghost">
                {x}
              </Tag>
            ))}
          </div>
        </section>
      </div>

      {editOpen ? (
        <EditProjectModal open onClose={() => setEditOpen(false)} audit={a} project={project} />
      ) : null}
    </div>
  );
}
