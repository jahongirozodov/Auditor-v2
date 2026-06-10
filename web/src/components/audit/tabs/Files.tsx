"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Download, Folder, Plus, Trash2, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { addAuditEvidence, deleteAuditEvidence } from "@/lib/actions/evidence";
import type { Audit, AuditEvidenceView } from "@/lib/types/entities";

function fmtSize(b: number): string {
  return b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

const ERROR_KEY: Record<string, string> = {
  comment_required: "evCommentRequired",
  no_file: "evNoFile",
  too_large: "evTooLarge",
  forbidden: "evForbidden",
};

interface Props {
  a: Audit;
  evidence: AuditEvidenceView[];
  canAdd: boolean;
  currentUserId: string;
}

export function Files({ a, evidence, canAdd, currentUserId }: Props) {
  const t = useTranslations("auditDetail");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function submit() {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast(t("evNoFile"), "danger");
    if (!comment.trim()) return toast(t("evCommentRequired"), "danger");
    const data = new FormData();
    data.set("auditId", a.id);
    data.set("comment", comment);
    data.set("file", file);
    startTransition(async () => {
      const res = await addAuditEvidence(data);
      if (res.ok) {
        toast(t("evAdded"), "success");
        setOpen(false);
        setComment("");
        setFileName("");
        router.refresh();
      } else {
        toast(t(ERROR_KEY[res.error ?? ""] ?? "evFailed"), "danger");
      }
    });
  }

  function remove(ev: AuditEvidenceView) {
    if (!confirm(t("evDeleteConfirm", { filename: ev.filename }))) return;
    startTransition(async () => {
      const res = await deleteAuditEvidence(ev.id);
      if (res.ok) {
        toast(t("evDeleted"), "warning");
        router.refresh();
      } else {
        toast(t("evFailed"), "danger");
      }
    });
  }

  return (
    <section className="panel">
      <div className="panel__h">
        <div className="panel__t">
          <Folder size={15} />
          <span>
            {t("evidenceTitle")} ({evidence.length})
          </span>
        </div>
        {canAdd && (
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>
            {t("evAdd")}
          </Button>
        )}
      </div>
      <div className="panel__body">
        {evidence.length === 0 ? (
          <div className="empty-state">
            <Folder size={28} />
            <div>{t("evEmpty")}</div>
          </div>
        ) : (
          <div className="tile-grid">
            {evidence.map((ev) => {
              const canDelete = canAdd || ev.uploadedBy === currentUserId;
              return (
                <div key={ev.id} className="tile" style={{ position: "relative" }}>
                  <div
                    className={`tile__thumb${/\.(txt|csv|cfg|log|json)$/i.test(ev.filename) ? " tile__thumb--code" : ""}`}
                  />
                  <div className="tile__body">
                    <div className="tile__name font-mono">{ev.filename}</div>
                    <div className="tile__meta">{fmtSize(ev.sizeBytes)}</div>
                    {ev.comment && (
                      <div className="cell-sub" style={{ fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>
                        {ev.comment}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <Avatar initials={ev.uploadedByAvatar} name={ev.uploadedByName} />
                      <span className="cell-sub" style={{ fontSize: 11 }}>
                        {ev.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <a
                        className="btn btn--ghost btn--xs"
                        href={`/api/evidence/${ev.id}`}
                        title={t("evDownload")}
                      >
                        <Download size={13} />
                        <span>{t("evDownload")}</span>
                      </a>
                      {canDelete && (
                        <button
                          className="btn btn--ghost btn--xs btn--icon btn--danger-hover"
                          title={t("evDelete")}
                          onClick={() => remove(ev)}
                          disabled={pending}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("evAdd")}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              {tCommon("cancel")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Upload size={14} />}
              onClick={submit}
              disabled={pending || !comment.trim() || !fileName}
            >
              {t("evAdd")}
            </Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 14 }}>
          <Field label={t("evFile")} htmlFor="ev-file">
            <input
              id="ev-file"
              ref={fileRef}
              type="file"
              className="input"
              onChange={(e) => setFileName(e.target.value)}
            />
          </Field>
          <Field label={t("evComment")} htmlFor="ev-comment">
            <textarea
              id="ev-comment"
              className="input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("evCommentPlaceholder")}
            />
          </Field>
        </div>
      </Modal>
    </section>
  );
}
