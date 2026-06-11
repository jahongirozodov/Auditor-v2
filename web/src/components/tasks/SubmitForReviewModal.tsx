"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Paperclip, Send, X } from "lucide-react";
import { submitTaskForReview } from "@/lib/actions/tasks";

const MAX_FILES = 5;
const MAX_BYTES = 20 * 1024 * 1024;

export interface SubmitForReviewModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
}

export function SubmitForReviewModal({ open, onClose, taskId }: SubmitForReviewModalProps) {
  const t = useTranslations("taskDetail.submitModal");
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    setFiles((prev) => [...prev, ...Array.from(incoming)].slice(0, MAX_FILES));
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleClose() {
    setComment("");
    setFiles([]);
    setError(null);
    onClose();
  }

  function handleSubmit() {
    if (comment.trim().length < 10) {
      setError(t("errorComment"));
      return;
    }
    for (const f of files) {
      if (f.size > MAX_BYTES) {
        setError(t("errorTooLarge"));
        return;
      }
    }
    setError(null);

    const fd = new FormData();
    fd.set("taskId", taskId);
    fd.set("comment", comment.trim());
    for (const f of files) fd.append("files", f);

    startTransition(async () => {
      const res = await submitTaskForReview(fd);
      if (res.ok) {
        setComment("");
        setFiles([]);
        onClose();
      } else {
        if (res.error === "too_many_files") setError(t("errorTooMany"));
        else if (res.error === "too_large") setError(t("errorTooLarge"));
        else setError(t("errorComment"));
      }
    });
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal__h">
          <span className="modal__title">{t("title")}</span>
          <button
            type="button"
            className="btn btn--ghost btn--xs"
            onClick={handleClose}
            disabled={pending}
          >
            <X size={14} />
          </button>
        </div>

        <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label className="field__label" htmlFor="submit-comment">
              {t("commentLabel")}
            </label>
            <textarea
              id="submit-comment"
              className="select"
              rows={4}
              style={{ width: "100%", resize: "vertical" }}
              placeholder={t("commentPlaceholder")}
              value={comment}
              disabled={pending}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label">{t("filesLabel")}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={pending || files.length >= MAX_FILES}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={13} />
                <span>{t("filesBtn")}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {files.map((f, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.name}
                    </span>
                    <span className="cell-sub">{(f.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--xs"
                      onClick={() => removeFile(i)}
                      disabled={pending}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}
        </div>

        <div className="modal__foot">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleClose}
            disabled={pending}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleSubmit}
            disabled={pending}
          >
            <Send size={13} />
            <span>{t("submit")}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
