"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Star, Trash2, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { canManage } from "@/lib/rbac";
import { addMember, promoteLead, removeMember } from "@/lib/actions/audits";
import { findingsByAudit, tasksByAudit } from "@/lib/fixtures";
import type { ActionResult } from "@/lib/actions/types";
import type { Audit, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const ELIGIBLE = ["chief", "lead", "t1"];

export function Group({
  a,
  usersById,
  allUsers,
  role,
}: {
  a: Audit;
  usersById: Record<string, User>;
  allUsers: User[];
  role: RoleCode;
}) {
  const t = useTranslations("auditDetail");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const tasks = tasksByAudit(a.id);
  const findings = findingsByAudit(a.id);
  const canEdit = canManage(role, "audit");
  const candidates = allUsers.filter((u) => ELIGIBLE.includes(u.role) && !a.members.includes(u.id));
  const pick = (id: string): Pick<User, "avatar" | "name" | "title"> =>
    usersById[id] ?? { avatar: "?", name: id, title: "" };

  function act(fn: () => Promise<ActionResult>) {
    startTransition(async () => {
      const r = await fn();
      toast(r.ok ? t("done") : t("failed"), r.ok ? "success" : "danger");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: 16 }}
      >
        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Users size={15} />
              <span>{t("groupTitle")}</span>
            </div>
            <span className="tag tag--ghost">{a.members.length}</span>
          </div>
          <div className="panel__body panel__body--flush">
            {a.members.map((id) => {
              const u = pick(id);
              const isLead = id === a.leader;
              const tc = tasks.filter((x) => x.assignee === id).length;
              const fc = findings.filter((x) => x.reportedBy === id).length;
              return (
                <div key={id} className="lrow" style={{ border: "none", borderRadius: 0 }}>
                  <Avatar initials={u.avatar} name={u.name} size="lg" />
                  <div className="lrow__body">
                    <div className="lrow__title">{u.name}</div>
                    <div className="lrow__sub">{u.title}</div>
                  </div>
                  <span className={`tag ${isLead ? "tag--brand" : "tag--ghost"}`}>
                    {isLead ? t("dutyLead") : t("dutyAuditor")}
                  </span>
                  <div style={{ textAlign: "center", minWidth: 56 }}>
                    <div className="tabular font-bold">{tc}</div>
                    <div className="cell-sub">{t("colTasks")}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 56 }}>
                    <div className="tabular font-bold">{fc}</div>
                    <div className="cell-sub">{t("colFindings")}</div>
                  </div>
                  {canEdit ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      {!isLead ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs btn--icon"
                            aria-label={t("promote")}
                            title={t("promote")}
                            disabled={pending}
                            onClick={() => act(() => promoteLead({ auditId: a.id, userId: id }))}
                          >
                            <Star size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs btn--icon"
                            aria-label={t("remove")}
                            title={t("remove")}
                            disabled={pending}
                            onClick={() => act(() => removeMember({ auditId: a.id, userId: id }))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <UserPlus size={15} />
              <span>{t("addMember")}</span>
            </div>
            <span className="tag tag--ghost">{candidates.length}</span>
          </div>
          <div className="panel__body panel__body--flush">
            {!canEdit ? (
              <div style={{ padding: 16, color: "var(--text-tertiary)", fontSize: 13 }}>
                {t("dutyAuditor")}
              </div>
            ) : candidates.length === 0 ? (
              <div style={{ padding: 16, color: "var(--text-tertiary)", fontSize: 13 }}>
                {t("noCandidates")}
              </div>
            ) : (
              candidates.map((u) => (
                <div key={u.id} className="lrow" style={{ border: "none", borderRadius: 0 }}>
                  <Avatar initials={u.avatar} name={u.name} />
                  <div className="lrow__body">
                    <div className="lrow__title">{u.name}</div>
                    <div className="lrow__sub">{u.title}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--xs"
                    disabled={pending}
                    onClick={() => act(() => addMember({ auditId: a.id, userId: u.id }))}
                  >
                    <UserPlus size={13} />
                    <span>{t("addMember")}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
