"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { generateReport } from "@/lib/actions/reports";
import { REPORT_TYPES, REPORT_FORMATS } from "@/lib/reports/constants";
import type { Audit } from "@/lib/types/entities";

interface Props {
  open: boolean;
  onClose: () => void;
  audits: Audit[];
}

export function ReportGenerateModal({ open, onClose, audits }: Props) {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [auditId, setAuditId] = useState(audits[0]?.id ?? "");
  const [type, setType] = useState<string>(REPORT_TYPES[0]);
  const [formats, setFormats] = useState<string[]>(["PDF"]);

  function toggleFormat(f: string) {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function submit() {
    startTransition(async () => {
      const res = await generateReport({ title, auditId, type, formats });
      if (res.ok) {
        toast(t("generated"), "success");
        setTitle("");
        setFormats(["PDF"]);
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
      title={t("generateTitle")}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
            {tCommon("cancel")}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={submit}
            disabled={pending || !title.trim() || !auditId || !formats.length}
          >
            {pending ? t("generating") : t("generate")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <Field label={t("fieldTitle")} htmlFor="rg-title">
          <input
            id="rg-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder={t("fieldTitlePlaceholder")}
          />
        </Field>
        <Field label={t("fieldAudit")} htmlFor="rg-audit">
          <select
            id="rg-audit"
            className="select"
            value={auditId}
            onChange={(e) => setAuditId(e.target.value)}
          >
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("fieldType")} htmlFor="rg-type">
          <select
            id="rg-type"
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {REPORT_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("fieldFormat")} htmlFor="rg-fmt">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {REPORT_FORMATS.map((f) => (
              <label
                key={f}
                style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={formats.includes(f)}
                  onChange={() => toggleFormat(f)}
                />
                <span className="tag tag--outline">{f}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
