"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { editProject } from "@/lib/actions/projects";
import type { Audit } from "@/lib/types/entities";

const toLines = (arr: string[]) => arr.join("\n");
const toArray = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  audit: Audit;
}

export function EditProjectModal({ open, onClose, audit }: EditProjectModalProps) {
  const t = useTranslations("auditDetail");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [goal, setGoal] = useState(audit.goal ?? "");
  const [methodology, setMethodology] = useState(audit.methodology ?? "");
  const [scope, setScope] = useState(toLines(audit.scope));
  const [tools, setTools] = useState(toLines(audit.tools));

  const valid = goal.trim().length > 0;

  function submit() {
    if (!valid) return;
    startTransition(async () => {
      const res = await editProject({
        auditId: audit.id,
        goal,
        methodology,
        scope: toArray(scope),
        tools: toArray(tools),
      });
      if (res.ok) {
        toast(t("saved"), "success");
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
          <Pencil size={16} /> {t("editProject")}
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
            <Pencil size={14} />
            <span>{t("save")}</span>
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={t("fGoal")} htmlFor="ep-goal">
          <textarea
            id="ep-goal"
            className="textarea"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ minHeight: 80 }}
          />
        </Field>

        <Field label={t("fMethodology")} htmlFor="ep-methodology">
          <textarea
            id="ep-methodology"
            className="textarea"
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
            style={{ minHeight: 56 }}
          />
        </Field>

        <Field label={t("fScope")} hint={t("arrayHint")} htmlFor="ep-scope">
          <textarea
            id="ep-scope"
            className="textarea"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={{ minHeight: 96 }}
          />
        </Field>

        <Field label={t("fTools")} hint={t("arrayHint")} htmlFor="ep-tools">
          <textarea
            id="ep-tools"
            className="textarea"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            style={{ minHeight: 96 }}
          />
        </Field>
      </div>
    </Modal>
  );
}
