"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Map, Pencil, Wrench } from "lucide-react";
import { ApprovalFlow } from "@/components/approval/ApprovalFlow";
import { EditProjectModal } from "@/components/audit/EditProjectModal";
import { Tag } from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";
import { projectApproval as projectApprovalAction } from "@/lib/actions/projects";
import { APPROVAL_STAGES, canActAt, projectCurrentOf } from "@/lib/approval";
import { USERS } from "@/lib/fixtures";
import type { ApprovalView } from "@/lib/data/approval";
import type { Audit } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type ProjectAction = "submit" | "resubmit" | "approve" | "return";
const EDITABLE = ["project_draft", "returned"];
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

export function Project({
  a,
  role,
  approval,
}: {
  a: Audit;
  role: RoleCode;
  approval: ApprovalView | null;
}) {
  const t = useTranslations("auditDetail");
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const view: ApprovalView = approval ?? {
    stages: APPROVAL_STAGES,
    timeline: [],
    current: projectCurrentOf(a.status, null),
  };
  const canSubmit = canActAt(role, "group_lead"); // group_lead duty (approx by role)
  const canEdit = canSubmit && EDITABLE.includes(a.status);

  function run(action: ProjectAction, comment?: string) {
    startTransition(async () => {
      const res = await projectApprovalAction({ auditId: a.id, action, comment });
      toast(res.ok ? t("done") : t("failed"), res.ok ? "success" : "danger");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ApprovalFlow
        stages={view.stages}
        timeline={view.timeline}
        current={view.current}
        role={role}
        usersById={usersById}
        canSubmit={canSubmit}
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
              <div className="text-primary">{a.goal ?? t("goalText")}</div>
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
            {a.scope.length > 0 ? (
              <div>
                <div className="field__label">{t("scopeTitle")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {a.scope.map((s) => (
                    <Tag key={s} tone="outline">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <div className="field__label">{t("methodology")}</div>
              <div className="text-primary">{a.methodology ?? t("methodologyText")}</div>
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
            {a.tools.map((x) => (
              <Tag key={x} tone="ghost">
                {x}
              </Tag>
            ))}
          </div>
        </section>
      </div>

      {editOpen ? <EditProjectModal open onClose={() => setEditOpen(false)} audit={a} /> : null}
    </div>
  );
}
