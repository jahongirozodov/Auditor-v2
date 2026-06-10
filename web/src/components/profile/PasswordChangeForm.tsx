"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { changeOwnPassword } from "@/lib/actions/profile";

const ERROR_KEY: Record<string, string> = {
  wrong_current: "pwWrongCurrent",
  weak: "pwWeak",
  mismatch: "pwMismatch",
};

export function PasswordChangeForm() {
  const t = useTranslations("profile");
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit() {
    startTransition(async () => {
      const res = await changeOwnPassword({ current, next, confirm });
      if (res.ok) {
        toast(t("pwChanged"), "success");
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        toast(t(ERROR_KEY[res.error ?? ""] ?? "saveFailed"), "danger");
      }
    });
  }

  return (
    <>
      <div className="form-grid">
        <Field label={t("fieldCurrent")} htmlFor="pw-current" className="span-2">
          <input
            id="pw-current"
            className="input"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••••"
          />
        </Field>
        <Field label={t("fieldNew")} htmlFor="pw-new">
          <input
            id="pw-new"
            className="input"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label={t("fieldConfirm")} htmlFor="pw-confirm">
          <input
            id="pw-confirm"
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
      </div>
      <div className="cell-sub" style={{ fontSize: 11.5, marginTop: 12, marginBottom: 12 }}>
        {t("pwHint")}
      </div>
      <Button
        size="sm"
        variant="primary"
        icon={<Check size={14} />}
        onClick={submit}
        disabled={pending || !current || !next || !confirm}
      >
        {t("changePassword")}
      </Button>
    </>
  );
}
