"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Sev } from "@/components/ui/Sev";
import { useToast } from "@/components/ui/Toast";
import { ApprovalFlow } from "@/components/approval/ApprovalFlow";
import { RemediationFlow } from "./RemediationFlow";
import { findingApproval, findingRemediation } from "@/lib/actions/findings";
import { APPROVAL_STAGES, canActAt, currentOf } from "@/lib/approval";
import { REMEDIATION_STATUSES, type RemediationAction } from "@/lib/findings-machine";
import type { FindingApprovalView } from "@/lib/data/approval";
import type {
  ApprovalEvent,
  Finding,
  FindingEvidenceView,
  Task,
  User,
} from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type ApprovalAction = "submit" | "resubmit" | "approve" | "return";

export interface FindingDrawerProps {
  finding: Finding | null;
  approval: FindingApprovalView | null;
  remediation: ApprovalEvent[];
  evidences: FindingEvidenceView[];
  tasks: Task[];
  usersById: Record<string, User>;
  userId: string;
  role: RoleCode;
  onClose: () => void;
}

export function FindingDrawer({
  finding,
  approval,
  remediation,
  evidences,
  tasks,
  usersById,
  userId,
  role,
  onClose,
}: FindingDrawerProps) {
  const t = useTranslations("findings");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  if (!finding) return <Drawer open={false} onClose={onClose} />;

  const view: FindingApprovalView = approval ?? {
    stages: APPROVAL_STAGES,
    timeline: [],
    current: currentOf(finding.status, null),
  };
  const canSubmit = userId === finding.reportedBy || canActAt(role, "group_lead");
  const reporter = usersById[finding.reportedBy] ?? { name: finding.reportedBy };
  // Remediation actor = the assignee of the finding's linked task (or a lead, server-checked).
  const task = tasks.find((tk) => tk.id === finding.taskId);
  const isAssignee = task?.assignee === userId;

  function run(action: ApprovalAction, comment?: string) {
    startTransition(async () => {
      const res = await findingApproval({ findingId: finding!.id, action, comment });
      toast(res.ok ? t("done") : t("failed"), res.ok ? "success" : "danger");
    });
  }

  function runRem(action: RemediationAction, comment?: string) {
    startTransition(async () => {
      const res = await findingRemediation({ findingId: finding!.id, action, comment });
      toast(res.ok ? t("done") : t("failed"), res.ok ? "success" : "danger");
    });
  }

  const props: [string, string][] = [
    [t("asset"), finding.asset],
    [t("type"), finding.type],
    [t("cwe"), finding.cwe],
    [t("reportedBy"), reporter.name],
    [t("date"), finding.date],
    ["CVSS", String(finding.cvss)],
  ];

  return (
    <Drawer
      open
      onClose={onClose}
      wide
      title={
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sev level={finding.severity} />
            <span className="font-mono cell-sub">{finding.id}</span>
            <span className="cell-sub">· CVSS</span>
            <span className="font-bold tabular">{finding.cvss}</span>
            {finding.ai ? (
              <span className="tag tag--brand">
                <Sparkles size={12} /> AI
              </span>
            ) : null}
          </div>
          <div className="panel__t" style={{ fontSize: 16 }}>
            {finding.title}
          </div>
        </div>
      }
      footer={
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
          {t("close")}
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {props.map(([k, v]) => (
          <div key={k} className="field">
            <span className="field__label">{k}</span>
            <div className="text-primary" style={{ fontSize: 13.5 }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
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
      </div>

      {REMEDIATION_STATUSES.includes(finding.status) ? (
        <div style={{ marginTop: 20 }}>
          <RemediationFlow
            status={finding.status}
            isAssignee={isAssignee}
            role={role}
            timeline={remediation}
            usersById={usersById}
            pending={pending}
            onAction={runRem}
          />
        </div>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <h4>{t("drawerDesc")}</h4>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{finding.description}</p>
      </div>

      {finding.ai ? (
        <div className="ai-card" style={{ marginTop: 20 }}>
          <div className="ai-card__inner">
            <div className="ai-card__head">
              <span className="ai-card__icon">
                <Sparkles size={15} />
              </span>
              <span className="ai-card__title">{t("drawerAi")}</span>
              <span className="tag tag--brand" style={{ marginLeft: "auto" }}>
                qwen2.5:14b
              </span>
            </div>
            <p className="ai-card__body">{finding.description}</p>
          </div>
        </div>
      ) : null}

      <h4 style={{ marginTop: 20 }}>
        {t("drawerEvidence")} ({evidences.length})
      </h4>
      {evidences.length > 0 ? (
        <div className="tile-grid">
          {evidences.map((evidence) => (
            <div key={evidence.id} className="tile">
              <div
                role="img"
                aria-label={evidence.filename}
                className="tile__thumb"
                style={{
                  backgroundImage: `url(${evidence.dataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="tile__body">
                <div className="tile__name font-mono">{evidence.filename}</div>
                <div className="tile__meta">{Math.ceil(evidence.sizeBytes / 1024)} KB</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tile-grid">
          <div className="tile">
            <div className="tile__thumb tile__thumb--code" />
            <div className="tile__body">
              <div className="tile__name font-mono">{t("evidenceEmpty")}</div>
              <div className="tile__meta">{t("evidenceHint")}</div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
