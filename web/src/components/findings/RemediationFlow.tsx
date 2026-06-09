"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ShieldCheck, Send, Wrench, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { FINDING_STATUS_LABELS } from "@/lib/fixtures";
import {
  canDoRemediation,
  remediationActionsFor,
  type RemediationAction,
} from "@/lib/findings-machine";
import type { ApprovalEvent, FindingStatus, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const STEPS: FindingStatus[] = ["approved", "fixing", "fixed", "retest", "closed"];
const ACTION_KEY: Record<RemediationAction, string> = {
  startFixing: "remStart",
  markFixed: "remMarkFixed",
  startRetest: "remStartRetest",
  passRetest: "remPass",
  failRetest: "remFail",
};

export interface RemediationFlowProps {
  status: FindingStatus;
  isAssignee: boolean;
  role: RoleCode;
  timeline: ApprovalEvent[];
  usersById: Record<string, User>;
  pending?: boolean;
  onAction: (action: RemediationAction, comment?: string) => void;
}

export function RemediationFlow({
  status,
  isAssignee,
  role,
  timeline,
  usersById,
  pending = false,
  onAction,
}: RemediationFlowProps) {
  const t = useTranslations("findings");
  const [failing, setFailing] = useState(false);
  const [comment, setComment] = useState("");

  const cur = FINDING_STATUS_LABELS[status];
  const idx = STEPS.indexOf(status);
  // Actor-allowed actions (dummy comment satisfies needsComment — the box is shown on click).
  const actions = remediationActionsFor(status).filter(
    (a) => canDoRemediation(a, status, { role, isAssignee }, "x").ok,
  );
  const pick = (id: string): Pick<User, "avatar" | "name"> =>
    usersById[id] ?? { avatar: "?", name: id };

  function send() {
    onAction("failRetest", comment);
    setFailing(false);
    setComment("");
  }

  return (
    <div className="panel apf">
      <div className="panel__h">
        <div className="panel__t">
          <Wrench size={15} />
          <span>{t("remTitle")}</span>
        </div>
        <Tag tone={cur.tone}>{cur.label}</Tag>
      </div>
      <div className="panel__body">
        <div className="apf__strip">
          {STEPS.map((s, i) => {
            const done = i < idx || status === "closed";
            const isCur = i === idx && status !== "closed";
            return (
              <Fragment key={s}>
                {i > 0 ? <div className={`apf__conn${done ? " apf__conn--done" : ""}`} /> : null}
                <div
                  className={`apf__node${done ? " apf__node--done" : isCur ? " apf__node--current" : ""}`}
                >
                  <div className="apf__dot">{done ? <Check size={14} /> : i + 1}</div>
                  <div className="apf__nbody">
                    <div className="apf__ntitle">{FINDING_STATUS_LABELS[s].label}</div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className="apf__bar">
          <div className="apf__meta">{status === "closed" ? t("remClosed") : t("remHint")}</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {actions.map((a) =>
              a === "failRetest" ? (
                <button
                  key={a}
                  type="button"
                  className="btn btn--danger btn--sm"
                  disabled={pending}
                  onClick={() => setFailing((v) => !v)}
                >
                  <X size={14} />
                  <span>{t(ACTION_KEY[a])}</span>
                </button>
              ) : (
                <button
                  key={a}
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={pending}
                  onClick={() => onAction(a)}
                >
                  {a === "passRetest" ? <ShieldCheck size={14} /> : <Wrench size={14} />}
                  <span>{t(ACTION_KEY[a])}</span>
                </button>
              ),
            )}
          </div>
        </div>

        {failing ? (
          <div style={{ marginBottom: 12 }}>
            <label className="field__label" htmlFor="rem-comment">
              {t("remReason")}
            </label>
            <textarea
              id="rem-comment"
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
                <span>{t("remSend")}</span>
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pending}
                onClick={() => setFailing(false)}
              >
                <X size={14} />
                <span>{t("remCancel")}</span>
              </button>
            </div>
          </div>
        ) : null}

        <div className="apf__tl">
          {timeline.map((e, i) => {
            const u = pick(e.who);
            const label = ACTION_KEY[e.action as RemediationAction]
              ? t(ACTION_KEY[e.action as RemediationAction])
              : e.action;
            return (
              <div key={i} className={`apf__tlitem apf__tlitem--${e.state}`}>
                <div className="apf__tldot">
                  {e.state === "returned" ? <X size={12} /> : <Check size={12} />}
                </div>
                <div className="apf__tlbody">
                  <div className="apf__tlhead">
                    <Avatar initials={u.avatar} name={u.name} />
                    <span className="apf__tlname">{u.name}</span>
                    <span className="apf__tlaction">{label}</span>
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
