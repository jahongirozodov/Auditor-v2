"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { createAudit } from "@/lib/actions/audits";
import type { Organization, User } from "@/lib/types/entities";

const TYPES = ["Kompleks audit", "Texnik audit", "Penetration test", "Web audit", "Maxsus audit"];

export interface CreateAuditModalProps {
  open: boolean;
  onClose: () => void;
  orgs: Organization[];
  eligibleUsers: User[];
}

export function CreateAuditModal({ open, onClose, orgs, eligibleUsers }: CreateAuditModalProps) {
  const t = useTranslations("audits");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [orgId, setOrgId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const valid =
    title.trim().length >= 3 && orgId && startDate && endDate && startDate <= endDate && leaderId;

  function toggleMember(id: string) {
    setMemberIds((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  function submit() {
    if (!valid) return;
    startTransition(async () => {
      const res = await createAudit({
        title,
        type,
        orgId,
        startDate,
        endDate,
        leaderId,
        memberIds,
      });
      if (res.ok && res.id) {
        toast(t("created"), "success");
        onClose();
        router.push(`/audits/${res.id}`);
      } else {
        toast(t("failed"), "danger");
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
            <Plus size={14} />
            <span>{t("create")}</span>
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fName")} htmlFor="ca-title">
            <Input
              id="ca-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Aloqa vazirligi — yillik kompleks audit"
            />
          </Field>
        </div>

        <Field label={t("fType")} htmlFor="ca-type">
          <select
            id="ca-type"
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

        <Field label={t("fOrg")} htmlFor="ca-org">
          <select
            id="ca-org"
            className="select"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          >
            <option value="">—</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fStart")} htmlFor="ca-start">
          <Input
            id="ca-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>

        <Field label={t("fEnd")} htmlFor="ca-end">
          <Input
            id="ca-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>

        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fLeader")} htmlFor="ca-leader">
            <select
              id="ca-leader"
              className="select"
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
            >
              <option value="">—</option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fAuditors")}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {eligibleUsers.map((u) => {
                const on = memberIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    className={`tag ${on ? "tag--brand" : "tag--outline"}`}
                    onClick={() => toggleMember(u.id)}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
