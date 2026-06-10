"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  listConversations,
  deleteConversation,
  type ConversationSummary,
} from "@/lib/actions/ai-chat";

/**
 * Saved-thread picker for the /ai assistant. Mounted fresh each time it opens
 * (parent gates on `historyOpen`), so it loads once on mount and only sets state
 * from async callbacks — no synchronous setState inside the effect.
 */
export function ChatHistoryModal({
  onClose,
  auditId,
  onPick,
}: {
  onClose: () => void;
  auditId: string;
  onPick: (id: string) => void;
}) {
  const t = useTranslations("ai");
  const [rows, setRows] = useState<ConversationSummary[] | null>(null);

  useEffect(() => {
    let alive = true;
    listConversations({ auditId }).then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, [auditId]);

  async function remove(id: string) {
    await deleteConversation({ id });
    setRows((r) => (r ? r.filter((x) => x.id !== id) : r));
  }

  return (
    <Modal open onClose={onClose} title={t("histTitle")}>
      {rows === null ? (
        <p className="text-sm text-muted">{t("histLoading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">{t("histEmpty")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                background: "var(--bg-surface-2)",
              }}
            >
              <button
                type="button"
                className="navitem"
                onClick={() => onPick(r.id)}
                style={{ flex: 1, minWidth: 0, textAlign: "left", padding: 0, background: "none" }}
              >
                <MessageSquare size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                <span
                  className="label"
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {r.title}
                </span>
                <span className="cell-sub" style={{ marginLeft: "auto", flexShrink: 0 }}>
                  {t("histCount", { count: r.messageCount })}
                </span>
              </button>
              <button
                type="button"
                className="iconbtn"
                aria-label={t("histDelete")}
                onClick={() => void remove(r.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
