"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, GitBranch, Lock, Send, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CAN_ACT, type ApprovalCurrent } from "@/lib/approval";
import type { ApprovalEvent, ApprovalStage, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

/**
 * 3-step approval strip + immutable timeline. Buttons are wired to callbacks
 * provided by the parent (which binds the finding/project Server Actions).
 * `current` = stage key | "returned" | "new" (pre-submit) | null (approved).
 */
export interface ApprovalFlowProps {
  stages: ApprovalStage[];
  timeline: ApprovalEvent[];
  current: ApprovalCurrent;
  role: RoleCode;
  usersById: Record<string, User>;
  /** Discoverer or group-lead may submit/resubmit. */
  canSubmit?: boolean;
  pending?: boolean;
  onApprove?: () => void;
  onReturn?: (comment: string) => void;
  onResubmit?: () => void;
  onSubmit?: () => void;
}

export function ApprovalFlow({
  stages,
  timeline,
  current,
  role,
  usersById,
  canSubmit = false,
  pending = false,
  onApprove,
  onReturn,
  onResubmit,
  onSubmit,
}: ApprovalFlowProps) {
  const t = useTranslations("approval");
  const [returning, setReturning] = useState(false);
  const [comment, setComment] = useState("");

  const approved = current === null;
  const returned = current === "returned";
  const isNew = current === "new";
  const idx = stages.findIndex((s) => s.key === current);
  const curStage = idx >= 0 ? stages[idx] : null;
  const canAct = !!curStage && CAN_ACT[curStage.key].includes(role);
  const isLast = curStage?.key === "dept";
  const pick = (id: string): Pick<User, "avatar" | "name"> =>
    usersById[id] ?? { avatar: "?", name: id };

  function send() {
    onReturn?.(comment);
    setReturning(false);
    setComment("");
  }

  return (
    <div className="panel apf">
      <div className="panel__h">
        <div className="panel__t">
          <GitBranch size={15} />
          <span>{t("title")}</span>
        </div>
        {approved ? (
          <span className="tag tag--success">{t("approved")}</span>
        ) : returned ? (
          <span className="tag tag--danger">{t("returned")}</span>
        ) : isNew ? (
          <span className="tag tag--ghost">{t("draft")}</span>
        ) : (
          <span className="tag tag--warning">{t("inProgress")}</span>
        )}
      </div>
      <div className="panel__body">
        <div className="apf__strip">
          {stages.map((s, i) => {
            const done = approved || (idx >= 0 && i < idx);
            const isCur = !approved && i === idx;
            return (
              <Fragment key={s.key}>
                {i > 0 ? <div className={`apf__conn${done ? " apf__conn--done" : ""}`} /> : null}
                <div
                  className={`apf__node${done ? " apf__node--done" : isCur ? " apf__node--current" : ""}`}
                >
                  <div className="apf__dot">{done ? <Check size={14} /> : i + 1}</div>
                  <div className="apf__nbody">
                    <div className="apf__ntitle">{s.title}</div>
                    <div className="apf__nrole">{s.role}</div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className="apf__bar">
          <div className="apf__meta">
            {approved
              ? t("allDone")
              : returned
                ? t("returnedMsg")
                : isNew
                  ? t("draftMsg")
                  : t("queue", { stage: curStage?.title ?? "" })}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {isNew && canSubmit && onSubmit ? (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={pending}
                onClick={onSubmit}
              >
                <Send size={14} />
                <span>{t("submit")}</span>
              </button>
            ) : returned && canSubmit && onResubmit ? (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={pending}
                onClick={onResubmit}
              >
                <Send size={14} />
                <span>{t("resubmit")}</span>
              </button>
            ) : !approved && !isNew && canAct && (onApprove || onReturn) ? (
              <>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  disabled={pending}
                  onClick={() => setReturning((v) => !v)}
                >
                  <X size={14} />
                  <span>{t("reject")}</span>
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={pending}
                  onClick={onApprove}
                >
                  <Check size={14} />
                  <span>{isLast ? t("approveFinal") : t("approve")}</span>
                </button>
              </>
            ) : !approved && !isNew ? (
              <span className="apf__wait">
                <Lock size={13} /> {t("wait", { stage: curStage?.title ?? "" })}
              </span>
            ) : null}
          </div>
        </div>

        {returning ? (
          <div style={{ marginBottom: 12 }}>
            <label className="field__label" htmlFor="apf-comment">
              {t("returnReason")}
            </label>
            <textarea
              id="apf-comment"
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
                onClick={send}
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

        <div className="apf__tl">
          {timeline.map((e, i) => {
            const u = pick(e.who);
            return (
              <div key={i} className={`apf__tlitem apf__tlitem--${e.state}`}>
                <div className="apf__tldot">
                  {e.state === "returned" ? <X size={12} /> : <Check size={12} />}
                </div>
                <div className="apf__tlbody">
                  <div className="apf__tlhead">
                    <Avatar initials={u.avatar} name={u.name} />
                    <span className="apf__tlname">{u.name}</span>
                    <span className="apf__tlaction">{e.action}</span>
                    <span className="apf__tltime tabular">{e.t}</span>
                  </div>
                  {e.comment ? <div className="apf__tlcomment">“{e.comment}”</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
