"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckSquare, Clock, Pause } from "lucide-react";
import { Stat } from "@/components/ui/Stat";
import { Panel } from "@/components/ui/Panel";
import { Sev } from "@/components/ui/Sev";
import { ChevronRight } from "lucide-react";
import type { Finding, Task, TaskStatus, User } from "@/lib/types/entities";

const STATUS_ORDER: TaskStatus[] = [
  "new",
  "assigned",
  "in_progress",
  "review",
  "review_head",
  "returned",
  "done",
  "blocked",
];

export interface MemberViewProps {
  myTasks: Task[];
  myFindings: Finding[];
  usersById: Record<string, User>;
  userId: string;
}

export function MemberView({ myTasks, myFindings }: MemberViewProps) {
  const t = useTranslations("dashboard");

  const count = (statuses: TaskStatus[]) =>
    myTasks.filter((tk) => statuses.includes(tk.status)).length;

  const inProgress = count(["new", "assigned", "in_progress"]);
  const inReview = count(["review", "review_head"]);
  const done = count(["done"]);
  const blocked = count(["returned", "blocked"]);

  const statusLabel: Record<TaskStatus, string> = {
    new: t("taskStatusNew"),
    assigned: t("taskStatusAssigned"),
    in_progress: t("taskStatusInProgress"),
    review: t("taskStatusReview"),
    review_head: t("taskStatusReviewHead"),
    returned: t("taskStatusReturned"),
    done: t("taskStatusDone"),
    blocked: t("taskStatusBlocked"),
  };

  const criticalFindings = myFindings.filter(
    (f) => f.severity === "critical" || f.severity === "high",
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <Stat
          icon={<Clock size={15} />}
          label={t("statInProgress")}
          value={inProgress}
          meta={`${myTasks.length} ta jami`}
          bar={myTasks.length > 0 ? Math.round((inProgress / myTasks.length) * 100) : 0}
        />
        <Stat
          icon={<CheckSquare size={15} />}
          label={t("statReview")}
          value={inReview}
          meta={`${myTasks.length} ta jami`}
        />
        <Stat
          icon={<CheckSquare size={15} />}
          label={t("statDone")}
          value={done}
          meta={`${myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0}%`}
          bar={myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0}
        />
        <Stat
          icon={<Pause size={15} />}
          label={t("statBlocked")}
          value={blocked}
          meta={blocked > 0 ? "Diqqat talab" : "Hammasi yaxshi"}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <Panel
          icon={<CheckSquare size={15} />}
          title={t("panelMyTasks")}
          flush
          actions={
            <Link href="/tasks" className="btn btn--ghost btn--xs">
              <span>{t("viewAll")}</span>
              <ChevronRight size={12} />
            </Link>
          }
        >
          {myTasks.length === 0 ? (
            <p style={{ padding: "var(--space-4)", color: "var(--text-secondary)", fontSize: 13 }}>
              {t("noTasks")}
            </p>
          ) : (
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t("thStatus")}</th>
                    <th style={{ textAlign: "right" }}>Soni</th>
                  </tr>
                </thead>
                <tbody>
                  {STATUS_ORDER.map((s) => {
                    const n = myTasks.filter((tk) => tk.status === s).length;
                    return (
                      <tr key={s} style={{ opacity: n === 0 ? 0.4 : 1 }}>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 13,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                flexShrink: 0,
                                background:
                                  s === "done"
                                    ? "var(--color-success, #22c55e)"
                                    : s === "blocked" || s === "returned"
                                      ? "var(--status-danger-fg)"
                                      : s === "review" || s === "review_head"
                                        ? "var(--color-warning, #f59e0b)"
                                        : "var(--color-info)",
                              }}
                            />
                            {statusLabel[s]}
                          </span>
                        </td>
                        <td
                          className="font-mono"
                          style={{ textAlign: "right", fontWeight: n > 0 ? 700 : 400 }}
                        >
                          {n}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          icon={<AlertTriangle size={15} style={{ color: "var(--status-danger-fg)" }} />}
          title={t("panelMyFindings")}
          flush
          actions={
            <Link href="/findings" className="btn btn--ghost btn--xs">
              <span>{t("all")}</span>
              <ChevronRight size={12} />
            </Link>
          }
        >
          {myFindings.length === 0 ? (
            <p style={{ padding: "var(--space-4)", color: "var(--text-secondary)", fontSize: 13 }}>
              {t("noFindings")}
            </p>
          ) : (
            <>
              {criticalFindings.slice(0, 5).map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    padding: "10px 16px",
                    borderBottom:
                      i < Math.min(criticalFindings.length, 5) - 1
                        ? "1px solid var(--border-color)"
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Sev level={f.severity} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.title}
                    </div>
                    <div className="cell-sub font-mono" style={{ marginTop: 2 }}>
                      CVSS {f.cvss} · {f.asset}
                    </div>
                  </div>
                </div>
              ))}
              {myFindings.length > criticalFindings.length && (
                <div
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  + {myFindings.length - criticalFindings.length} ta boshqa topilma
                </div>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
