"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  LayoutDashboard,
  Monitor,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { OverviewTab } from "./OverviewTab";
import { ActivityTab } from "./ActivityTab";
import { SessionsTab } from "./SessionsTab";
import { SecurityTab } from "./SecurityTab";
import { SettingsTab } from "./SettingsTab";
import type { ProfileData } from "@/lib/data/profile";

export function ProfileScreen({ data }: { data: ProfileData }) {
  const t = useTranslations("profile");
  const tNav = useTranslations("nav");
  const [tab, setTab] = useState("overview");
  const { user, kpi } = data;

  const heroStats = [
    { v: kpi.total, l: t("kpiScore"), delta: kpi.delta },
    { v: kpi.audits, l: t("heroAudits") },
    { v: kpi.tasks, l: t("heroTasks") },
    { v: kpi.findings, l: t("heroFindings") },
  ];

  const tabs = [
    { id: "overview", label: t("tabOverview"), icon: <LayoutDashboard size={14} /> },
    {
      id: "activity",
      label: t("tabActivity"),
      icon: <Activity size={14} />,
      count: data.activity.length,
    },
    { id: "sessions", label: t("tabSessions"), icon: <Monitor size={14} /> },
    { id: "security", label: t("tabSecurity"), icon: <ShieldCheck size={14} /> },
    { id: "settings", label: t("tabSettings"), icon: <Settings size={14} /> },
  ];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={`${user.title} · ${user.dept}`}
      />

      <div className="profile-hero">
        <div className="profile-hero__av">
          <Avatar initials={user.avatar} name={user.name} size="xl" />
        </div>
        <div className="profile-hero__info">
          <div className="profile-hero__name">
            <span>{user.name}</span>
            <span className="tag tag--success">
              <span className="dot" style={{ width: 6, height: 6 }} />
              {t("online")}
            </span>
          </div>
          <div className="profile-hero__role">{user.title}</div>
          <div className="profile-hero__meta">
            <span>
              <span className="font-mono">{user.email}</span>
            </span>
            <span>
              <span>
                {t("metaLastLogin")}:{" "}
                {data.lastLogin ? data.lastLogin.slice(0, 16).replace("T", " ") : t("metaNever")}
              </span>
            </span>
          </div>
        </div>
        <div className="profile-hero__kpi">
          {heroStats.map((s) => (
            <div key={s.l} className="profile-kpi">
              <div className="profile-kpi__v tabular">{s.v}</div>
              <div className="profile-kpi__l">{s.l}</div>
              {s.delta != null && (
                <div className={`profile-kpi__d${s.delta < 0 ? " is-neg" : ""}`}>
                  {s.delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                  <span>
                    {s.delta > 0 ? "+" : ""}
                    {s.delta}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      {tab === "overview" && <OverviewTab data={data} />}
      {tab === "activity" && <ActivityTab activity={data.activity} />}
      {tab === "sessions" && <SessionsTab data={data} />}
      {tab === "security" && <SecurityTab />}
      {tab === "settings" && <SettingsTab user={data.user} />}
    </div>
  );
}
