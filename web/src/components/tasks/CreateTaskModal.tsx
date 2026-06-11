"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { createTask } from "@/lib/actions/tasks";
import type { Audit, User } from "@/lib/types/entities";

const TYPES = ["Konfiguratsiya", "Skaner", "Trafik", "Tizim audit", "Log", "Hujjat", "Hisobot"];
const PRIORITIES = ["Yuqori", "Oʻrta", "Past"];

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  audits: Audit[];
  usersById: Record<string, User>;
  defaultAuditId: string;
  defaultAssigneeId?: string;
}

export function CreateTaskModal({
  open,
  onClose,
  audits,
  usersById,
  defaultAuditId,
  defaultAssigneeId,
}: CreateTaskModalProps) {
  const t = useTranslations("assign");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [auditId, setAuditId] = useState(defaultAuditId);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [priority, setPriority] = useState("Oʻrta");
  const [due, setDue] = useState("");
  const initialAudit = audits.find((a) => a.id === defaultAuditId);
  const pickAssignee = (audit?: Audit) =>
    audit?.members.includes(defaultAssigneeId ?? "")
      ? (defaultAssigneeId ?? "")
      : (audit?.members[0] ?? "");
  const [assigneeId, setAssigneeId] = useState(pickAssignee(initialAudit));

  const audit = audits.find((a) => a.id === auditId);
  const members = (audit?.members ?? []).map(
    (id) => usersById[id] ?? { id, name: id, title: "", avatar: "?", role: "t1", dept: "" },
  );

  const valid = title.trim().length >= 3 && Boolean(auditId) && Boolean(due) && Boolean(assigneeId);

  function changeAudit(id: string) {
    const nextAudit = audits.find((a) => a.id === id);
    setAuditId(id);
    setAssigneeId(pickAssignee(nextAudit));
  }

  const ERROR_KEY: Record<string, string> = {
    forbidden: "errForbidden",
    illegal_status: "errIllegalStatus",
    not_member: "errNotMember",
    invalid: "requiredHint",
  };

  function submit() {
    if (!valid) {
      toast(t("requiredHint"), "danger");
      return;
    }
    startTransition(async () => {
      const res = await createTask({ auditId, title, type, priority, due, assigneeId });
      if (res.ok) {
        toast(t("created"), "success");
        onClose();
        router.refresh();
      } else {
        toast(t(ERROR_KEY[res.error ?? ""] ?? "failed"), "danger");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> {t("createTitle")}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            disabled={pending}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={submit}
            disabled={pending || !valid}
          >
            <Check size={14} />
            <span>{t("create")}</span>
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fName")} htmlFor="ct-title">
            <Input
              id="ct-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Firewall qoidalari va segmentatsiyani tahlil qilish"
            />
          </Field>
        </div>

        <Field label={t("fAudit")} htmlFor="ct-audit">
          <select
            id="ct-audit"
            className="select"
            value={auditId}
            onChange={(e) => changeAudit(e.target.value)}
          >
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fType")} htmlFor="ct-type">
          <select
            id="ct-type"
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fPriority")} htmlFor="ct-priority">
          <select
            id="ct-priority"
            className="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fDue")} htmlFor="ct-due">
          <DatePicker id="ct-due" value={due} onChange={setDue} />
        </Field>

        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fAssignee")} htmlFor="ct-assignee">
            <select
              id="ct-assignee"
              className="select"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">—</option>
              {members.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!valid ? (
          <p
            className="cell-sub"
            role="note"
            style={{ gridColumn: "span 2", color: "var(--text-tertiary)", margin: 0 }}
          >
            {t("requiredHint")}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
