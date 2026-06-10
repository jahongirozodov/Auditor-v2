"use client";

import { Bell, Globe2, LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ProfileInfoForm } from "./ProfileInfoForm";
import type { ProfileUser } from "@/lib/data/profile";

const NOTIFICATIONS = ["notifCritical", "notifDue", "notifGroup", "notifReport", "notifAgent"];
const LANGS = ["langUz", "langRu", "langEn"];

export function SettingsTab({ user }: { user: ProfileUser }) {
  const t = useTranslations("profile");

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, .8fr)", gap: 16 }}
    >
      <section className="panel">
        <div className="panel__h">
          <div className="panel__t">
            <Settings size={15} />
            <span>{t("personalInfo")}</span>
          </div>
        </div>
        <div className="panel__body">
          <ProfileInfoForm user={user} />
        </div>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Bell size={15} />
              <span>{t("notifTitle")}</span>
            </div>
            <Tag tone="ghost">{t("soon")}</Tag>
          </div>
          <div
            className="panel__body"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <p className="cell-sub" style={{ margin: 0 }}>
              {t("notifNote")}
            </p>
            {NOTIFICATIONS.map((key) => (
              <label key={key} className="checkline">
                <input type="checkbox" disabled />
                <span>{t(key)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Globe2 size={15} />
              <span>{t("langTitle")}</span>
            </div>
          </div>
          <div
            className="panel__body"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <label className="field">
              <span className="field__label">{t("fieldLang")}</span>
              <select className="select" defaultValue="langUz" disabled>
                {LANGS.map((key) => (
                  <option key={key} value={key}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <LogOut size={15} />
              <span>{t("dangerZone")}</span>
            </div>
          </div>
          <div
            className="panel__body"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <Button size="sm" variant="ghost" disabled>
              {t("signOutAll")}
            </Button>
            <div className="cell-sub">{t("signOutAllSub")}</div>
            <Button size="sm" variant="ghost" disabled>
              {t("requestDelete")}
            </Button>
            <div className="cell-sub">{t("requestDeleteSub")}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
