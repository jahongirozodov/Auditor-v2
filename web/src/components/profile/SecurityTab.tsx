"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Fingerprint,
  Info,
  Key,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { PasswordChangeForm } from "./PasswordChangeForm";

function StaticRow({
  icon,
  title,
  sub,
  on,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  on: boolean;
}) {
  return (
    <div className="sec-row">
      <div className={`sec-row__icon${on ? " is-on" : ""}`}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
        <div className="cell-sub" style={{ fontSize: 11.5 }}>
          {sub}
        </div>
      </div>
      <label className="switch">
        <input type="checkbox" defaultChecked={on} disabled />
        <span className="switch__track">
          <span className="switch__thumb" />
        </span>
      </label>
    </div>
  );
}

function AlertRow({
  tone,
  title,
  sub,
}: {
  tone: "warning" | "info" | "success";
  title: string;
  sub: string;
}) {
  const icon =
    tone === "warning" ? (
      <AlertTriangle size={13} />
    ) : tone === "success" ? (
      <ShieldCheck size={13} />
    ) : (
      <Info size={13} />
    );
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        className={`notif-item__icon notif-item__icon--${tone}`}
        style={{ width: 26, height: 26, borderRadius: 8 }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
        <div className="cell-sub" style={{ fontSize: 11 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

export function SecurityTab() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
      <Panel title={t("passwordTitle")} icon={<Lock size={15} />}>
        <PasswordChangeForm />
      </Panel>

      <Panel
        title={t("twoFaTitle")}
        icon={<ShieldCheck size={15} />}
        actions={<span className="tag tag--outline">{t("soon")}</span>}
      >
        <StaticRow
          icon={<Smartphone size={16} />}
          title={t("twoFaApp")}
          sub="Google Authenticator"
          on={false}
        />
        <StaticRow icon={<Mail size={16} />} title={t("twoFaEmail")} sub="email" on={false} />
        <StaticRow icon={<Key size={16} />} title={t("twoFaBackup")} sub="—" on={false} />
        <StaticRow icon={<Fingerprint size={16} />} title={t("twoFaWebauthn")} sub="—" on={false} />
        <div className="cell-sub" style={{ fontSize: 11.5, marginTop: 10 }}>
          {t("twoFaNote")}
        </div>
      </Panel>

      <Panel
        title={t("alertsTitle")}
        icon={<ShieldAlert size={15} />}
        actions={<span className="tag tag--outline">{tCommon("soon")}</span>}
        className="span-2"
        flush
      >
        <AlertRow tone="warning" title="—" sub={t("alertsNote")} />
      </Panel>
    </div>
  );
}
