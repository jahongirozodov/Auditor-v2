"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { KeyRound, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { issueToken } from "@/lib/actions/tokens";
import type { Audit, User } from "@/lib/types/entities";

const ISSUE_ROLES = new Set(["chief", "lead", "t1"]);

export interface IssueTokenModalProps {
  open: boolean;
  onClose: () => void;
  audit: Audit;
  usersById: Record<string, User>;
}

/**
 * Issue an audit token for a member of THIS audit. Mirrors the admin /tokens issue
 * modal but with the audit fixed. Calls {@link issueToken} (admin-only, re-checked
 * server-side); device identity is bound later when the EXE agent first connects.
 */
export function IssueTokenModal({ open, onClose, audit, usersById }: IssueTokenModalProps) {
  const t = useTranslations("tokens");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Tokens are issued to auditors (chief/lead/t1); fall back to all members.
  const candidates = audit.members.map((id) => usersById[id]).filter((u): u is User => Boolean(u));
  const members = candidates.filter((u) => ISSUE_ROLES.has(u.role));
  const userOptions = members.length ? members : candidates;

  const [userId, setUserId] = useState(userOptions[0]?.id ?? "");
  const [expires, setExpires] = useState("");
  const [device, setDevice] = useState("");

  const valid = Boolean(userId) && Boolean(expires);

  function submit() {
    if (!valid) return;
    startTransition(async () => {
      const res = await issueToken({ auditId: audit.id, userId, expires, device });
      if (res.ok) {
        toast(t("created"), "success");
        setDevice("");
        onClose();
        router.refresh();
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
          <KeyRound size={16} /> {t("issueTitle")}
        </span>
      }
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={submit}
            disabled={pending || !valid}
          >
            {t("create")}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field className="span-2" label={t("fUser")} htmlFor="itk-user">
          <Select
            id="itk-user"
            value={userId}
            onChange={setUserId}
            options={userOptions.map((u) => ({ value: u.id, label: `${u.name} — ${u.title}` }))}
          />
        </Field>
        <Field label={t("fExpires")} htmlFor="itk-exp">
          <input
            id="itk-exp"
            type="datetime-local"
            className="input"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
        </Field>
        <Field label={t("fDevice")} htmlFor="itk-dev" hint={t("deviceHint")}>
          <input
            id="itk-dev"
            className="input font-mono"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            placeholder="DESKTOP-..."
          />
        </Field>
      </div>
    </Modal>
  );
}
