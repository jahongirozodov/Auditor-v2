"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { createFinding } from "@/lib/actions/findings";
import { SEV_CVSS } from "@/lib/severity";
import type { Audit, Severity, Task } from "@/lib/types/entities";

const SEVERITIES: { v: Severity; k: string }[] = [
  { v: "critical", k: "sevCritical" },
  { v: "high", k: "sevHigh" },
  { v: "medium", k: "sevMedium" },
  { v: "low", k: "sevLow" },
  { v: "info", k: "sevInfo" },
];
const TYPES = [
  "Konfiguratsiya kamchiligi",
  "Tizim sozlamasi",
  "CVE / patch",
  "Web zaiflik",
  "Trafik anomaliya",
  "Operatsion kamchilik",
];

export interface CreateFindingModalProps {
  open: boolean;
  onClose: () => void;
  audits: Audit[];
  tasks: Task[];
  defaultAuditId: string;
}

export function CreateFindingModal({
  open,
  onClose,
  audits,
  tasks,
  defaultAuditId,
}: CreateFindingModalProps) {
  const t = useTranslations("findings");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [auditId, setAuditId] = useState(defaultAuditId);
  const auditTasks = tasks.filter((tk) => tk.auditId === auditId);
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState(auditTasks[0]?.id ?? "");
  const [severity, setSeverity] = useState<Severity>("high");
  const [cvss, setCvss] = useState(SEV_CVSS.high);
  const [cwe, setCwe] = useState("CWE-284");
  const [asset, setAsset] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");

  const valid =
    title.trim().length >= 3 && Boolean(auditId) && Boolean(taskId) && cvss >= 0 && cvss <= 10;

  function changeAudit(id: string) {
    setAuditId(id);
    setTaskId(tasks.find((tk) => tk.auditId === id)?.id ?? ""); // tasks differ per audit
  }

  function changeSeverity(v: Severity) {
    setSeverity(v);
    setCvss(SEV_CVSS[v]); // auto-derive CVSS (still editable)
  }

  function submit() {
    if (!valid) return;
    startTransition(async () => {
      const res = await createFinding({
        auditId,
        taskId,
        title,
        severity,
        cvss,
        cwe,
        asset,
        type,
        description,
      });
      if (res.ok) {
        toast(t("created"), "success");
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
          <Field label={t("fName")} htmlFor="cf-title">
            <Input
              id="cf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Login forma — SQL injection (POST /api/v1/login)"
            />
          </Field>
        </div>

        <Field label={t("fAudit")} htmlFor="cf-audit">
          <select
            id="cf-audit"
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

        <Field label={t("fTask")} htmlFor="cf-task">
          <select
            id="cf-task"
            className="select"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          >
            {auditTasks.length === 0 ? <option value="">{t("noTasks")}</option> : null}
            {auditTasks.map((tk) => (
              <option key={tk.id} value={tk.id}>
                {tk.id} — {tk.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fSeverity")} htmlFor="cf-severity">
          <select
            id="cf-severity"
            className="select"
            value={severity}
            onChange={(e) => changeSeverity(e.target.value as Severity)}
          >
            {SEVERITIES.map((s) => (
              <option key={s.v} value={s.v}>
                {t(s.k)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fCvss")} htmlFor="cf-cvss">
          <Input
            id="cf-cvss"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={cvss}
            onChange={(e) => setCvss(Number(e.target.value))}
          />
        </Field>

        <Field label={t("fCwe")} htmlFor="cf-cwe">
          <Input id="cf-cwe" value={cwe} onChange={(e) => setCwe(e.target.value)} />
        </Field>

        <Field label={t("fAsset")} htmlFor="cf-asset">
          <Input
            id="cf-asset"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="FW-CORE-01 yoki 10.20.4.142"
          />
        </Field>

        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fType")} htmlFor="cf-type">
            <select
              id="cf-type"
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
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fDescription")} htmlFor="cf-desc">
            <textarea
              id="cf-desc"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kamchilik tavsifi, dalillar va kuzatish konteksti..."
              style={{ minHeight: 96 }}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
