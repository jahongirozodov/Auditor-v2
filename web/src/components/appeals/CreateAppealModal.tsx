"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Paperclip, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createAppeal } from "@/lib/actions/appeals";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

interface SelectedFile {
  id: string;
  file: File;
}

export function CreateAppealModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("appeals");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<"taklif" | "kamchilik">("taklif");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("orta");
  const [files, setFiles] = useState<SelectedFile[]>([]);

  function reset() {
    setType("taklif");
    setTitle("");
    setDescription("");
    setPriority("orta");
    setFiles([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const remaining = MAX_FILES - files.length;
    const toAdd: SelectedFile[] = [];
    for (const f of picked.slice(0, remaining)) {
      if (f.size > MAX_FILE_BYTES) {
        toast(`${f.name}: hajm 20 MB dan oshmasin`, "danger");
        continue;
      }
      toAdd.push({ id: crypto.randomUUID(), file: f });
    }
    setFiles((prev) => [...prev, ...toAdd]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleSubmit() {
    if (!title.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      if (type === "kamchilik") fd.append("priority", priority);
      for (const { file } of files) fd.append("files", file);

      const res = await createAppeal(fd);
      if (res.ok) {
        toast(t("done"), "success");
        reset();
        onClose();
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  const priorityOptions = [
    { value: "past", label: t("priority_past") },
    { value: "orta", label: t("priority_orta") },
    { value: "yuqori", label: t("priority_yuqori") },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("createTitle")}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleClose}>
            {t("close")}
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={pending || !title.trim()}
            onClick={handleSubmit}
          >
            {pending ? "Yuklanmoqda..." : t("new")}
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Type */}
        <Field label={t("createTypeLabel")} htmlFor="appeal-type">
          <div style={{ display: "flex", gap: 8 }}>
            {(["taklif", "kamchilik"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setType(v)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: `1.5px solid ${type === v ? "var(--color-accent)" : "var(--border-subtle)"}`,
                  background: type === v ? "var(--color-accent)18" : "var(--bg-elevated)",
                  color: type === v ? "var(--color-accent)" : "var(--text-secondary)",
                  fontWeight: type === v ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {v === "taklif" ? t("createTypeTaklif") : t("createTypeKamchilik")}
              </button>
            ))}
          </div>
        </Field>

        {/* Title */}
        <Field label={t("createTitleLabel")} htmlFor="appeal-title">
          <Input
            id="appeal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("createTitlePlaceholder")}
          />
        </Field>

        {/* Description */}
        <Field label={t("createDescLabel")} htmlFor="appeal-desc">
          <textarea
            id="appeal-desc"
            className="input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("createDescPlaceholder")}
            style={{ resize: "vertical", width: "100%" }}
          />
        </Field>

        {/* Priority (kamchilik only) */}
        {type === "kamchilik" && (
          <Field label={t("createPriorityLabel")} htmlFor="appeal-priority">
            <Select
              id="appeal-priority"
              value={priority}
              onChange={(v) => setPriority(v)}
              options={priorityOptions}
            />
          </Field>
        )}

        {/* Files */}
        <Field label={t("createFilesLabel")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {files.map(({ id, file }) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--bg-elevated)",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <Paperclip size={13} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: 11.5, whiteSpace: "nowrap" }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                  aria-label="Oʻchirish"
                >
                  <X size={13} style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
            ))}
            {files.length < MAX_FILES && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ alignSelf: "flex-start" }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip size={13} />
                  Fayl biriktirish ({files.length}/{MAX_FILES})
                </button>
              </>
            )}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
