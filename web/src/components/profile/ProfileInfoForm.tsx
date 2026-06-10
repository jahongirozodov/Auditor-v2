"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateOwnProfile } from "@/lib/actions/profile";
import type { ProfileUser } from "@/lib/data/profile";

export function ProfileInfoForm({ user }: { user: ProfileUser }) {
  const t = useTranslations("profile");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [workPhone, setWorkPhone] = useState(user.workPhone ?? "");

  function submit() {
    startTransition(async () => {
      const res = await updateOwnProfile({ name, phone, workPhone });
      if (res.ok) {
        toast(t("saved"), "success");
        router.refresh();
      } else {
        toast(t("saveFailed"), "danger");
      }
    });
  }

  return (
    <>
      <div className="form-grid">
        <Field label={t("fieldName")} htmlFor="pf-name" className="span-2">
          <input
            id="pf-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t("fieldTitle")} htmlFor="pf-title" className="span-2" hint={t("titleHint")}>
          <input id="pf-title" className="input" defaultValue={user.title} disabled />
        </Field>
        <Field label={t("fieldPhone")} htmlFor="pf-phone">
          <input
            id="pf-phone"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123-45-67"
          />
        </Field>
        <Field label={t("fieldWorkPhone")} htmlFor="pf-work">
          <input
            id="pf-work"
            className="input"
            value={workPhone}
            onChange={(e) => setWorkPhone(e.target.value)}
          />
        </Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Button
          size="sm"
          variant="primary"
          icon={<Check size={14} />}
          onClick={submit}
          disabled={pending || name.trim().length < 2}
        >
          {t("save")}
        </Button>
      </div>
    </>
  );
}
