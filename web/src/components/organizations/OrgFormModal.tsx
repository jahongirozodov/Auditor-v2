"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createOrganization, updateOrganization } from "@/lib/actions/orgs";
import { SectorManagerModal } from "./SectorManagerModal";
import type { Organization, OrgDetail, Sector } from "@/lib/types/entities";

const EMPTY = {
  name: "",
  stir: "",
  sector: "",
  contact: "",
  head: "",
};

type OrgFormValue = typeof EMPTY;

export interface EditableOrganization {
  org: Organization;
  detail: OrgDetail;
}

interface OrgFormModalProps {
  open: boolean;
  onClose: () => void;
  organization?: EditableOrganization | null;
  sectors: Sector[];
  canManageSectors?: boolean;
}

function toFormValue(value?: EditableOrganization | null): OrgFormValue {
  if (!value) return EMPTY;
  return {
    name: value.org.name,
    stir: value.org.stir,
    sector: value.org.sector,
    contact: value.org.contact,
    head: value.detail.head,
  };
}

export function OrgFormModal({
  open,
  onClose,
  organization,
  sectors,
  canManageSectors = false,
}: OrgFormModalProps) {
  const t = useTranslations("orgs");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sectorMgrOpen, setSectorMgrOpen] = useState(false);
  const [form, setForm] = useState<OrgFormValue>(() => toFormValue(organization));

  const isEdit = !!organization;
  const valid =
    form.name.trim().length >= 3 &&
    /^\d{9}$/.test(form.stir.trim()) &&
    form.sector.trim().length >= 2 &&
    form.contact.trim().length >= 2 &&
    form.head.trim().length >= 2;

  function set<K extends keyof OrgFormValue>(key: K, value: OrgFormValue[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!valid) return;
    startTransition(async () => {
      const res = isEdit
        ? await updateOrganization(organization.org.id, form)
        : await createOrganization(form);

      if (res.ok) {
        toast(isEdit ? t("updated") : t("created"), "success");
        onClose();
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Building2 size={16} /> {isEdit ? t("editTitle") : t("createTitle")}
        </span>
      }
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={isEdit ? <Save size={14} /> : <Building2 size={14} />}
            onClick={submit}
            disabled={pending || !valid}
          >
            {isEdit ? t("save") : t("create")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
        <div style={{ gridColumn: "span 2" }}>
          <Field label={t("fName")} htmlFor="org-name">
            <input
              id="org-name"
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
            />
          </Field>
        </div>

        <Field label={t("fStir")} htmlFor="org-stir" hint={t("stirHint")}>
          <input
            id="org-stir"
            className="input font-mono"
            inputMode="numeric"
            maxLength={9}
            value={form.stir}
            onChange={(e) => set("stir", e.target.value.replace(/\D/g, "").slice(0, 9))}
          />
        </Field>

        <Field label={t("fSector")} htmlFor="org-sector">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Select
              id="org-sector"
              options={sectors.map((s) => ({ value: s.name, label: s.name }))}
              value={form.sector}
              onChange={(v) => set("sector", v)}
              placeholder="—"
              style={{ flex: 1 }}
            />
            {canManageSectors && (
              <button
                type="button"
                className="iconbtn"
                aria-label={t("sectorMgrTitle")}
                title={t("sectorMgrTitle")}
                onClick={() => setSectorMgrOpen(true)}
              >
                <Plus size={15} />
              </button>
            )}
          </div>
        </Field>

        <Field label={t("fContact")} htmlFor="org-contact">
          <input
            id="org-contact"
            className="input"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
          />
        </Field>

        <Field label={t("fHead")} htmlFor="org-head">
          <input
            id="org-head"
            className="input"
            value={form.head}
            onChange={(e) => set("head", e.target.value)}
          />
        </Field>
      </div>
    </Modal>
    {sectorMgrOpen ? (
      <SectorManagerModal
        open={sectorMgrOpen}
        onClose={() => setSectorMgrOpen(false)}
        sectors={sectors}
      />
    ) : null}
    </>
  );
}
