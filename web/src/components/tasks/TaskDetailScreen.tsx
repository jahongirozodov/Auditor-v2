"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronLeft,
  Eye,
  FileText,
  History,
  Inbox,
  Paperclip,
  Send,
  SquarePen,
  UserCheck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Sev } from "@/components/ui/Sev";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { TASK_STATUS } from "@/lib/fixtures";
import { reassignTask, taskTransition } from "@/lib/actions/tasks";
import type { TaskAction } from "@/lib/tasks-machine";
import type { TaskHistoryEntry } from "@/lib/data/tasks";
import type { Audit, Finding, Task, TaskPriority, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const FLOW: { key: string; labelKey: string; icon: LucideIcon }[] = [
  { key: "new", labelKey: "fNew", icon: Inbox },
  { key: "assigned", labelKey: "fAssigned", icon: UserCheck },
  { key: "in_progress", labelKey: "fInProgress", icon: Activity },
  { key: "review", labelKey: "fReview", icon: Eye },
  { key: "done", labelKey: "fDone", icon: Check },
];

const ACTIONS: Record<string, string[]> = {
  new: ["aAssign"],
  assigned: ["aStart"],
  in_progress: ["aSubmit", "aComplete"],
  review: ["aApprove", "aReturn"],
  returned: ["aRestart"],
  done: [],
  blocked: ["aUnblock"],
};

const ACTION_OF: Record<string, TaskAction> = {
  aAssign: "assign",
  aStart: "start",
  aSubmit: "submit",
  aComplete: "complete",
  aApprove: "approve",
  aReturn: "return",
  aRestart: "restart",
  aUnblock: "unblock",
};

const PRIORITY_TONE: Record<TaskPriority, TagTone> = {
  Yuqori: "danger",
  Oʻrta: "warning",
  Past: "ghost",
};

export interface TaskDetailScreenProps {
  task: Task | null;
  audit?: Audit;
  usersById: Record<string, User>;
  history: TaskHistoryEntry[];
  linkedFindings: Finding[];
  userId: string;
  role: RoleCode;
}

export function TaskDetailScreen({
  task,
  audit,
  usersById,
  history,
  linkedFindings,
}: TaskDetailScreenProps) {
  const t = useTranslations("taskDetail");
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [returning, setReturning] = useState(false);
  const [comment, setComment] = useState("");

  if (!task) {
    return (
      <div className="route-anim">
        <PageHeader
          crumbs={[
            { label: "Boshqaruv paneli", href: "/dashboard" },
            { label: "Mening vazifalarim", href: "/tasks" },
          ]}
          title={t("notFound")}
        />
      </div>
    );
  }

  const pick = (id: string): User =>
    usersById[id] ?? { id, name: id, role: "t1", title: "", avatar: "?", dept: "" };
  const assignee = pick(task.assignee);
  const members = audit ? audit.members.map(pick) : [assignee];
  const st = TASK_STATUS[task.status];
  const curIdx = FLOW.findIndex((f) => f.key === task.status);
  const actions = ACTIONS[task.status] ?? [];
  const created: TaskHistoryEntry = { who: task.assignee, action: t("aAssign"), time: task.due };
  const timeline = [created, ...history];

  function run(action: TaskAction, withComment?: string) {
    startTransition(async () => {
      const res = await taskTransition({ taskId: task!.id, action, comment: withComment });
      if (res.ok) {
        toast(t("done"), "success");
        setReturning(false);
        setComment("");
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  function onAction(labelKey: string) {
    const action = ACTION_OF[labelKey];
    if (action === "return") {
      setReturning((v) => !v);
      return;
    }
    run(action);
  }

  function onReassign(assigneeId: string) {
    if (assigneeId === task!.assignee) return;
    startTransition(async () => {
      const res = await reassignTask({ taskId: task!.id, assigneeId });
      toast(res.ok ? t("reassigned") : t("failed"), res.ok ? "success" : "danger");
    });
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[
          { label: "Boshqaruv paneli", href: "/dashboard" },
          { label: "Mening vazifalarim", href: "/tasks" },
          { label: task.id },
        ]}
        title={task.title}
        sub={`${task.id} · ${st.label}`}
        actions={
          <>
            <Link href="/tasks" className="btn btn--ghost btn--sm">
              <ChevronLeft size={14} />
              <span>{t("back")}</span>
            </Link>
            <button type="button" className="btn btn--secondary btn--sm">
              <SquarePen size={14} />
              <span>{t("edit")}</span>
            </button>
          </>
        }
      />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div
          className="panel__body"
          style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}
        >
          <div className="tflow">
            {FLOW.map((stage, i) => {
              const done = curIdx >= 0 && i < curIdx;
              const cur = curIdx >= 0 && i === curIdx;
              const Icon = stage.icon;
              return (
                <span key={stage.key} style={{ display: "contents" }}>
                  {i > 0 ? (
                    <div
                      className={`tflow__conn${done ? " tflow__conn--done" : " tflow__conn--empty"}`}
                    />
                  ) : null}
                  <div
                    className={`tflow__node${done ? " tflow__node--done" : cur ? " tflow__node--cur" : " tflow__node--future"}`}
                  >
                    <div className="tflow__dot">
                      {done ? <Check size={14} /> : <Icon size={14} />}
                    </div>
                    <span className="tflow__lab">{t(stage.labelKey)}</span>
                  </div>
                </span>
              );
            })}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {actions.map((act) => (
              <button
                key={act}
                type="button"
                className={`btn btn--sm ${act === "aReturn" ? "btn--danger" : "btn--primary"}`}
                disabled={pending}
                onClick={() => onAction(act)}
              >
                {t(act)}
              </button>
            ))}
          </div>
        </div>
        {returning ? (
          <div className="panel__body" style={{ borderTop: "1px solid var(--border-color)" }}>
            <label className="field__label" htmlFor="return-comment">
              {t("returnReason")}
            </label>
            <textarea
              id="return-comment"
              className="select"
              rows={2}
              style={{ width: "100%", resize: "vertical" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                disabled={pending || !comment.trim()}
                onClick={() => run("return", comment)}
              >
                <Send size={14} />
                <span>{t("send")}</span>
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pending}
                onClick={() => setReturning(false)}
              >
                <X size={14} />
                <span>{t("cancel")}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <FileText size={15} />
                <span>{t("descTitle")}</span>
              </div>
            </div>
            <div className="panel__body">
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{t("descText")}</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {[
                  [t("type"), task.type],
                  [t("due"), task.due],
                  [t("kpi"), task.kpi ? `+${task.kpi}` : "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="field__label">{k}</div>
                    <div className="text-primary" style={{ fontSize: 15 }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <AlertTriangle size={15} />
                <span>{t("findingsTitle")}</span>
              </div>
            </div>
            <div className="panel__body panel__body--flush">
              {linkedFindings.length ? (
                linkedFindings.map((f, i) => (
                  <div
                    key={f.id}
                    className="lrow"
                    style={{
                      border: "none",
                      borderRadius: 0,
                      borderBottom:
                        i < linkedFindings.length - 1 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <Sev level={f.severity} />
                    <div className="lrow__body">
                      <div className="lrow__title">{f.title}</div>
                      <div className="lrow__sub">
                        <span className="font-mono">{f.id}</span> · CVSS {f.cvss} · {f.cwe}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 16, color: "var(--text-tertiary)", fontSize: 13 }}>
                  {t("noFindings")}
                </div>
              )}
            </div>
          </section>

          {task.files ? (
            <section className="panel">
              <div className="panel__h">
                <div className="panel__t">
                  <Paperclip size={15} />
                  <span>{t("filesTitle")}</span>
                </div>
              </div>
              <div className="panel__body">
                <div className="tile-grid">
                  {Array.from({ length: task.files }).map((_, i) => (
                    <div key={i} className="tile">
                      <div className={`tile__thumb${i % 2 ? " tile__thumb--code" : ""}`} />
                      <div className="tile__body">
                        <div className="tile__name font-mono">
                          {["config.txt", "screenshot.png", "scan.csv", "capture.pcap"][i % 4]}
                        </div>
                        <div className="tile__meta">
                          {["4 KB", "1.2 MB", "18 KB", "3.4 MB"][i % 4]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <UserCheck size={15} />
                <span>{t("assignTitle")}</span>
              </div>
            </div>
            <div
              className="panel__body"
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={assignee.avatar} name={assignee.name} size="lg" />
                <div>
                  <div className="text-primary font-semi">{assignee.name}</div>
                  <div className="cell-sub">{assignee.title}</div>
                </div>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="reassign">
                  {t("reassign")}
                </label>
                <select
                  id="reassign"
                  className="select"
                  value={task.assignee}
                  disabled={pending}
                  onChange={(e) => onReassign(e.target.value)}
                >
                  {members.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="lrow"
                style={{ border: "none", borderRadius: 0, justifyContent: "space-between" }}
              >
                <span className="cell-sub">{t("priority")}</span>
                <Tag tone={PRIORITY_TONE[task.priority]}>{task.priority}</Tag>
              </div>
              <div
                className="lrow"
                style={{ border: "none", borderRadius: 0, justifyContent: "space-between" }}
              >
                <span className="cell-sub">{t("audit")}</span>
                <Link href={`/audits/${task.auditId}`} className="font-mono">
                  {audit?.code}
                </Link>
              </div>
              <div
                className="lrow"
                style={{ border: "none", borderRadius: 0, justifyContent: "space-between" }}
              >
                <span className="cell-sub">{t("reward")}</span>
                <span className="tabular font-semi">{task.kpi ? `+${task.kpi}` : "—"}</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <History size={15} />
                <span>{t("historyTitle")}</span>
              </div>
            </div>
            <div className="panel__body">
              <div className="apf__tl">
                {timeline.map((e, i) => {
                  const u = pick(e.who);
                  return (
                    <div key={i} className="apf__tlitem apf__tlitem--done">
                      <div className="apf__tldot">
                        <Check size={12} />
                      </div>
                      <div className="apf__tlbody">
                        <div className="apf__tlhead">
                          <Avatar initials={u.avatar} name={u.name} />
                          <span className="apf__tlname">{u.name}</span>
                          <span className="apf__tltime tabular">{e.time}</span>
                        </div>
                        <div className="apf__tlaction" style={{ marginTop: 2 }}>
                          {e.action}
                        </div>
                        {e.comment ? <div className="apf__tlcomment">“{e.comment}”</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
