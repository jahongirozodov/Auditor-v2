"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Layers, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createSector, deleteSector } from "@/lib/actions/sectors";
import type { Sector } from "@/lib/types/entities";

interface SectorManagerModalProps {
  open: boolean;
  onClose: () => void;
  sectors: Sector[];
}

export function SectorManagerModal({ open, onClose, sectors }: SectorManagerModalProps) {
  const t = useTranslations("orgs");
  const toast = useToast();
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  const canAdd = newName.trim().length >= 2;

  function add() {
    if (!canAdd || pending) return;
    startTransition(async () => {
      const res = await createSector({ name: newName.trim() });
      if (res.ok) {
        setNewName("");
        router.refresh();
      } else if (res.error === "duplicate") {
        toast(t("sectorDuplicate"), "danger");
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  function remove(id: string) {
    if (pending) return;
    startTransition(async () => {
      const res = await deleteSector(id);
      if (res.ok) {
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
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Layers size={16} /> {t("sectorMgrTitle")}
        </span>
      }
      footer={
        <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
          {t("cancel")}
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {sectors.length === 0 ? (
          <p
            className="cell-sub"
            style={{ padding: "12px 0", textAlign: "center", marginBottom: 16 }}
          >
            {t("sectorEmpty")}
          </p>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {sectors.map((s) => (
              <div
                key={s.id}
                className="lrow"
                style={{
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  borderRadius: 0,
                  padding: "8px 0",
                }}
              >
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
                  {s.name}
                </span>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={t("sectorDelete", { name: s.name })}
                  disabled={pending}
                  onClick={() => remove(s.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Field label={t("sectorNew")} htmlFor="sector-new-name">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="sector-new-name"
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder={t("sectorPlaceholder")}
              disabled={pending}
              autoFocus
            />
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={add}
              disabled={pending || !canAdd}
            >
              {t("sectorAdd")}
            </Button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}
