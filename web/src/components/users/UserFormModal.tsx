"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { createUser, updateUser } from "@/lib/actions/users";
import type { AdminUserView } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export const ROLE_OPTIONS: { code: RoleCode; label: string }[] = [
  { code: "super", label: "Departament rahbari" },
  { code: "head",  label: "Boʻlim boshligʻi" },
  { code: "chief", label: "Bosh mutaxassis" },
  { code: "lead",  label: "Yetakchi mutaxassis" },
  { code: "t1",    label: "1-toifa mutaxassis" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  user?: AdminUserView | null;
}

export function UserFormModal({ open, onClose, user }: Props) {
  const t       = useTranslations("users");
  const tCommon = useTranslations("common");
  const toast   = useToast();
  const [pending, startTransition] = useTransition();

  const isEdit = !!user;
  const [name,     setName]     = useState(user?.name ?? "");
  const [email,    setEmail]    = useState(user?.email ?? "");
  const [role,     setRole]     = useState<RoleCode>(user?.role ?? "t1");
  const [title,    setTitle]    = useState(user?.title ?? "");
  const [dept,     setDept]     = useState(user?.dept ?? "");
  const [password, setPassword] = useState("");

  // reset when user prop changes
  function handleOpen() {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setRole(user?.role ?? "t1");
    setTitle(user?.title ?? "");
    setDept(user?.dept ?? "");
    setPassword("");
  }

  function submit() {
    if (!name.trim() || !email.trim()) return;
    startTransition(async () => {
      const res = isEdit
        ? await updateUser(user!.id, { name, email, role, title, dept })
        : await createUser({ name, email, role, title, dept, password });
      if (res.ok) {
        toast(isEdit ? t("updated") : t("created"), "success");
        onClose();
      } else {
        toast((res as { ok: false; error?: string }).error ?? t("failed"), "danger");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("createTitle")}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
            {tCommon("cancel")}
          </Button>
          <Button size="sm" variant="primary" onClick={submit}
            disabled={pending || !name.trim() || !email.trim() || (!isEdit && !password.trim())}>
            {pending ? t("saving") : isEdit ? tCommon("save") : t("create")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <Field label={t("fieldName")} htmlFor="uf-name">
          <input id="uf-name" className="input" value={name}
            onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label={t("fieldEmail")} htmlFor="uf-email">
          <input id="uf-email" className="input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={t("fieldRole")} htmlFor="uf-role">
            <select id="uf-role" className="select" value={role}
              onChange={(e) => setRole(e.target.value as RoleCode)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </Field>
          <Field label={t("fieldDept")} htmlFor="uf-dept">
            <input id="uf-dept" className="input" value={dept}
              onChange={(e) => setDept(e.target.value)} />
          </Field>
        </div>
        <Field label={t("fieldTitle")} htmlFor="uf-title">
          <input id="uf-title" className="input" value={title}
            onChange={(e) => setTitle(e.target.value)} />
        </Field>
        {!isEdit && (
          <Field label={t("fieldPassword")} htmlFor="uf-pass">
            <input id="uf-pass" className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </Field>
        )}
      </div>
    </Modal>
  );
}
