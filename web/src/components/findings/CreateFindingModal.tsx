"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImagePlus, Plus, X } from "lucide-react";
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
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
type EvidenceMimeType = (typeof ALLOWED_IMAGE_TYPES)[number];

interface SelectedEvidenceImage {
  id: string;
  filename: string;
  mimeType: EvidenceMimeType;
  sizeBytes: number;
  dataBase64: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export interface CreateFindingModalProps {
  open: boolean;
  onClose: () => void;
  audits: Audit[];
  tasks: Task[];
  defaultAuditId: string;
  /** When set, audit/task selects are hidden and values are locked. */
  lockedAuditId?: string;
  lockedTaskId?: string;
}

export function CreateFindingModal({
  open,
  onClose,
  audits,
  tasks,
  defaultAuditId,
  lockedAuditId,
  lockedTaskId,
}: CreateFindingModalProps) {
  const t = useTranslations("findings");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const locked = Boolean(lockedAuditId && lockedTaskId);
  const [auditId, setAuditId] = useState(lockedAuditId ?? defaultAuditId);
  const auditTasks = tasks.filter((tk) => tk.auditId === auditId);
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState(lockedTaskId ?? auditTasks[0]?.id ?? "");
  const [severity, setSeverity] = useState<Severity>("high");
  const [cvss, setCvss] = useState(SEV_CVSS.high);
  const [cwe, setCwe] = useState("CWE-284");
  const [asset, setAsset] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<SelectedEvidenceImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function addEvidenceImages(files: FileList | null) {
    if (!files?.length) return;
    const next = [...evidenceImages];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGE_COUNT) {
        toast(t("invalidEvidence"), "danger");
        break;
      }
      if (
        !ALLOWED_IMAGE_TYPES.includes(file.type as EvidenceMimeType) ||
        file.size > MAX_IMAGE_BYTES
      ) {
        toast(t("invalidEvidence"), "danger");
        continue;
      }
      const mimeType = file.type as EvidenceMimeType;
      const dataBase64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${next.length}`,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
        dataBase64,
      });
    }
    setEvidenceImages(next);
  }

  function removeEvidenceImage(id: string) {
    setEvidenceImages((items) => items.filter((item) => item.id !== id));
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  }

  function handleDragLeave() {
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    void addEvidenceImages(e.dataTransfer.files);
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
        evidenceImages,
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

        {!locked ? (
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
        ) : null}

        {!locked ? (
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
        ) : null}

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

        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fEvidenceImages")} htmlFor="cf-evidence">
            <input
              ref={fileInputRef}
              id="cf-evidence"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                void addEvidenceImages(e.target.files);
                e.currentTarget.value = "";
              }}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label={t("fEvidenceImages")}
              className="card"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                background: isDragOver ? "var(--bg-surface-3)" : "var(--bg-surface-2)",
                borderStyle: "dashed",
                borderColor: isDragOver ? "var(--accent)" : "var(--border)",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <ImagePlus
                  size={28}
                  style={{
                    color: isDragOver ? "var(--accent)" : "var(--text-tertiary)",
                    transition: "color 0.15s",
                  }}
                />
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  {t("evidenceDrop")}{" "}
                  <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                    {t("evidenceSelectBtn")}
                  </span>
                </div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                  {t("evidenceHint")}
                </div>
              </div>
            </div>
          </Field>
          {evidenceImages.length > 0 ? (
            <div className="tile-grid" style={{ marginTop: 10 }}>
              {evidenceImages.map((image) => (
                <div key={image.id} className="tile">
                  <div
                    role="img"
                    aria-label={image.filename}
                    className="tile__thumb"
                    style={{
                      backgroundImage: `url(data:${image.mimeType};base64,${image.dataBase64})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="tile__body">
                    <div className="tile__name font-mono">{image.filename}</div>
                    <div className="tile__meta">{Math.ceil(image.sizeBytes / 1024)} KB</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => removeEvidenceImage(image.id)}
                    aria-label={t("removeEvidence")}
                    style={{ margin: 8 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
