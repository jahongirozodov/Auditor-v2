"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Search, Star, Trash2, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { canManage } from "@/lib/rbac";
import { addMember, promoteLead, removeMember } from "@/lib/actions/audits";
import { findingsByAudit, tasksByAudit } from "@/lib/fixtures";
import type { ActionResult } from "@/lib/actions/types";
import type { Audit, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";
import styles from "./Group.module.css";

const ELIGIBLE = ["chief", "lead", "t1"];

// ——— Draggable wrapper ———
function Draggable({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.draggableRow} ${isDragging ? styles.draggableRowDragging : ""}`}
      {...attributes}
    >
      {!disabled && (
        <span className={styles.gripHandle} {...listeners} aria-hidden="true">
          <GripVertical size={13} />
        </span>
      )}
      {children(isDragging)}
    </div>
  );
}

// ——— Droppable zone wrapper ———
function Droppable({
  id,
  activeClass,
  className,
  children,
}: {
  id: string;
  activeClass: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className ?? ""} ${isOver ? activeClass : ""}`}>
      {children}
    </div>
  );
}

// ——— Main component ———
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
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const tasks = tasksByAudit(a.id);
  const findings = findingsByAudit(a.id);
  const canEdit = canManage(role, "group");

  const candidates = allUsers.filter(
    (u) => ELIGIBLE.includes(u.role) && !a.members.includes(u.id),
  );
  const filtered = search.trim()
    ? candidates.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : candidates;

  const pick = (id: string): Pick<User, "avatar" | "name" | "title"> =>
    usersById[id] ?? { avatar: "?", name: id, title: "" };

  function act(fn: () => Promise<ActionResult>) {
    startTransition(async () => {
      const r = await fn();
      toast(r.ok ? t("done") : t("failed"), r.ok ? "success" : "danger");
    });
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || !canEdit) return;

    const src = active.id as string;
    const dst = over.id as string;
    const isCandidate = src.startsWith("candidate-");
    const isMember = src.startsWith("member-");
    const userId = src.replace(/^(?:candidate|member)-/, "");

    if (isCandidate && dst === "lead-zone") {
      startTransition(async () => {
        const r1 = await addMember({ auditId: a.id, userId });
        if (!r1.ok) { toast(t("failed"), "danger"); return; }
        const r2 = await promoteLead({ auditId: a.id, userId });
        toast(r2.ok ? t("done") : t("failed"), r2.ok ? "success" : "danger");
      });
    } else if (isCandidate && dst === "group-zone") {
      act(() => addMember({ auditId: a.id, userId }));
    } else if (isMember && dst === "candidates-zone" && userId !== a.leader) {
      act(() => removeMember({ auditId: a.id, userId }));
    } else if (isMember && dst === "lead-zone" && userId !== a.leader) {
      act(() => promoteLead({ auditId: a.id, userId }));
    }
  }

  const activeUserId = activeId?.replace(/^(?:candidate|member)-/, "");
  const activeUser = activeUserId ? pick(activeUserId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.layout}>

        {/* ——— Group panel ——— */}
        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Users size={15} />
              <span>{t("groupTitle")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!canEdit && (
                <span className={styles.lockBadge}>
                  <Lock size={12} />
                </span>
              )}
              <span className="tag tag--ghost">{a.members.length}</span>
            </div>
          </div>

          {/* Lead drop zone */}
          <Droppable id="lead-zone" activeClass={styles.leadZoneOver} className={styles.leadZone}>
            <Star size={13} className={styles.leadStar} />
            <span className={styles.leadLabel}>{t("dutyLead")}</span>
            {a.leader ? (
              <span className={styles.leadContent}>
                <Avatar initials={pick(a.leader).avatar} name={pick(a.leader).name} />
                {pick(a.leader).name}
              </span>
            ) : (
              <span className={styles.leadEmpty}>{t("groupNoLead")}</span>
            )}
          </Droppable>

          {/* Members list drop zone */}
          <Droppable id="group-zone" activeClass={styles.groupBodyOver} className={styles.groupBody}>
            {a.members.length === 0 ? (
              <div className={styles.emptyZone}>
                <Users size={24} className={styles.emptyZoneIcon} />
                <span>{t("groupNoMembers")}</span>
              </div>
            ) : (
              a.members.map((id) => {
                const u = pick(id);
                const isLead = id === a.leader;
                const tc = tasks.filter((x) => x.assignee === id).length;
                const fc = findings.filter((x) => x.reportedBy === id).length;
                return (
                  <Draggable key={id} id={`member-${id}`} disabled={!canEdit || isLead}>
                    {() => (
                      <div
                        className={`lrow ${styles.memberRow}`}
                        style={{ border: "none", borderRadius: 0 }}
                      >
                        <Avatar initials={u.avatar} name={u.name} size="lg" />
                        <div className="lrow__body">
                          <div className="lrow__title">{u.name}</div>
                          <div className="lrow__sub">{u.title}</div>
                        </div>
                        <span className={`tag ${isLead ? "tag--brand" : "tag--ghost"}`}>
                          {isLead ? t("dutyLead") : t("dutyAuditor")}
                        </span>
                        <div className={styles.stat}>
                          <span className={styles.statNum}>{tc}</span>
                          <span className={styles.statLabel}>{t("colTasks")}</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statNum}>{fc}</span>
                          <span className={styles.statLabel}>{t("colFindings")}</span>
                        </div>
                        {canEdit && !isLead && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              type="button"
                              className="btn btn--ghost btn--xs btn--icon"
                              aria-label={t("promote")}
                              title={t("promote")}
                              disabled={pending}
                              onClick={() =>
                                act(() => promoteLead({ auditId: a.id, userId: id }))
                              }
                            >
                              <Star size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--xs btn--icon"
                              aria-label={t("remove")}
                              title={t("remove")}
                              disabled={pending}
                              onClick={() =>
                                act(() => removeMember({ auditId: a.id, userId: id }))
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })
            )}
          </Droppable>
        </section>

        {/* ——— Candidates panel ——— */}
        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <UserPlus size={15} />
              <span>{t("addMember")}</span>
            </div>
            <span className="tag tag--ghost">{candidates.length}</span>
          </div>

          {canEdit && (
            <div className={styles.searchBar}>
              <Search size={13} />
              <input
                className={styles.searchInput}
                placeholder={t("groupSearch")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          <Droppable
            id="candidates-zone"
            activeClass={styles.candidatesBodyOver}
            className={styles.candidatesBody}
          >
            {!canEdit ? (
              <div style={{ padding: 16, color: "var(--text-tertiary)", fontSize: 13 }}>
                {t("dutyAuditor")}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 16, color: "var(--text-tertiary)", fontSize: 13 }}>
                {search.trim() ? t("groupNoResults") : t("noCandidates")}
              </div>
            ) : (
              filtered.map((u) => (
                <Draggable key={u.id} id={`candidate-${u.id}`} disabled={!canEdit}>
                  {() => (
                    <div
                      className={`lrow ${styles.candidateRow}`}
                      style={{ border: "none", borderRadius: 0 }}
                    >
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
                  )}
                </Draggable>
              ))
            )}
          </Droppable>
        </section>
      </div>

      {/* ——— Drag ghost overlay ——— */}
      <DragOverlay dropAnimation={null}>
        {activeUser && (
          <div className={styles.dragGhost}>
            <Avatar initials={activeUser.avatar} name={activeUser.name} />
            <span>{activeUser.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
