"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Bell,
  Brain,
  Building2,
  Edit3,
  Fingerprint,
  History,
  Info,
  Key,
  Lock,
  Mail,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { PERMISSIONS, ROLES, type PermissionId, type RoleCode } from "@/lib/types/roles";
import {
  addCustomRole,
  deleteCustomRole,
  saveKpiRules,
  saveSettings,
  testOllama,
  updateCustomRole,
} from "@/lib/actions/settings";
import type { CustomRole, SystemSettings } from "@/lib/settings-defaults";
import type { KpiRule } from "@/lib/types/entities";

type SectionId = "general" | "roles" | "kpi" | "ai" | "notif" | "security";

// Read-only system-role permission counts (mirrors the prototype's display order).
const SYS_PERMS: Record<RoleCode, string> = {
  super: "*",
  head: "38",
  chief: "22",
  lead: "16",
  t1: "9",
};

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="set-switch"
      data-on={String(on)}
      aria-pressed={on}
      onClick={onToggle}
    >
      <i />
    </button>
  );
}

function SettingRow({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string;
  desc?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="set-row">
      <div className="set-row__body">
        <div className="set-row__title">{title}</div>
        {desc ? <div className="set-row__desc">{desc}</div> : null}
      </div>
      <Switch on={on} onToggle={onToggle} />
    </div>
  );
}

export interface SettingsScreenProps {
  settings: SystemSettings;
  customRoles: CustomRole[];
  kpiRules: KpiRule[];
}

export function SettingsScreen({ settings, customRoles, kpiRules }: SettingsScreenProps) {
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [sec, setSec] = useState<SectionId>("general");
  const [gen, setGen] = useState(settings.general);
  const [ai, setAi] = useState(settings.ai);
  const [notif, setNotif] = useState(settings.notif);
  const [secu, setSecu] = useState(settings.security);
  const [kpi, setKpi] = useState(kpiRules);
  const [roles, setRoles] = useState(customRoles);

  const [addOpen, setAddOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [rName, setRName] = useState("");
  const [rCode, setRCode] = useState("");
  const [rBase, setRBase] = useState<RoleCode>("t1");
  const [rPerms, setRPerms] = useState<PermissionId[]>([]);

  const NAV: { id: SectionId; label: string; icon: LucideIcon }[] = [
    { id: "general", label: t("navGeneral"), icon: Settings },
    { id: "roles", label: t("navRoles"), icon: ShieldCheck },
    { id: "kpi", label: t("navKpi"), icon: Trophy },
    { id: "ai", label: t("navAi"), icon: Sparkles },
    { id: "notif", label: t("navNotif"), icon: Bell },
    { id: "security", label: t("navSecurity"), icon: Lock },
  ];

  function persist(section: "general" | "ai" | "notif" | "security", values: object) {
    startTransition(async () => {
      const res = await saveSettings({ section, values: values as Record<string, unknown> });
      toast(res.ok ? t("saved") : t("failed"), res.ok ? "success" : "danger");
    });
  }

  function runTest() {
    startTransition(async () => {
      const res = await testOllama();
      toast(
        res.ok ? t("testOk", { model: res.model ?? "" }) : t("testFail"),
        res.ok ? "success" : "danger",
      );
    });
  }

  function persistKpi() {
    startTransition(async () => {
      const res = await saveKpiRules({
        rules: kpi.map((r) => ({ code: r.code, points: r.points })),
      });
      toast(res.ok ? t("rulesSaved") : t("failed"), res.ok ? "success" : "danger");
    });
  }

  function resetRoleForm() {
    setEditingRole(null);
    setRName("");
    setRCode("");
    setRBase("t1");
    setRPerms([]);
  }

  function openCreateRole() {
    resetRoleForm();
    setAddOpen(true);
  }

  function openEditRole(role: CustomRole) {
    setEditingRole(role);
    setRName(role.name);
    setRCode(role.code);
    setRBase(role.baseRole);
    setRPerms(role.permissions);
    setAddOpen(true);
  }

  function closeRoleModal() {
    setAddOpen(false);
    resetRoleForm();
  }

  function submitRole() {
    const payload = {
      name: rName,
      code: rCode,
      baseRole: rBase,
      permissions: rPerms,
    };
    startTransition(async () => {
      const res = editingRole ? await updateCustomRole(payload) : await addCustomRole(payload);
      if (res.ok) {
        const nextRole = {
          name: rName,
          code: rCode,
          baseRole: rBase,
          permissions: rPerms,
          tone: editingRole?.tone ?? "tag--info",
        };
        setRoles((r) =>
          editingRole ? r.map((role) => (role.code === rCode ? nextRole : role)) : [...r, nextRole],
        );
        closeRoleModal();
        toast(editingRole ? t("roleUpdated") : t("roleAdded"), "success");
      } else {
        toast(res.error === "duplicate" ? t("duplicate") : t("failed"), "danger");
      }
    });
  }

  function toggleRolePermission(permission: PermissionId) {
    setRPerms((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission],
    );
  }

  function removeRole(code: string) {
    startTransition(async () => {
      const res = await deleteCustomRole({ code });
      if (res.ok) {
        setRoles((r) => r.filter((x) => x.code !== code));
        toast(t("roleDeleted"), "warning");
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  const saveFoot = (onClick: () => void) => (
    <Button
      size="sm"
      variant="primary"
      icon={<Save size={14} />}
      onClick={onClick}
      disabled={pending}
    >
      {t("save")}
    </Button>
  );

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub")}
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "220px minmax(0, 1fr)", gap: 16, alignItems: "start" }}
      >
        {/* SECTION NAV */}
        <div className="card" style={{ padding: 8, position: "sticky", top: 12 }}>
          <nav className="set-nav">
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`set-nav__item${sec === n.id ? " set-nav__item--active" : ""}`}
                  onClick={() => setSec(n.id)}
                >
                  <Icon size={16} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION BODY */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sec === "general" && (
            <Panel
              title={t("orgTitle")}
              icon={<Building2 size={15} />}
              flush
              footer={saveFoot(() => persist("general", gen))}
            >
              <div className="form-grid" style={{ padding: 16 }}>
                <Field className="span-2" label={t("deptName")} htmlFor="s-dept">
                  <input
                    id="s-dept"
                    className="input"
                    value={gen.deptName}
                    onChange={(e) => setGen({ ...gen, deptName: e.target.value })}
                  />
                </Field>
                <Field label={t("lang")} htmlFor="s-lang">
                  <select
                    id="s-lang"
                    className="select"
                    value={gen.lang}
                    onChange={(e) => setGen({ ...gen, lang: e.target.value })}
                  >
                    <option value="uz">{t("langUz")}</option>
                    <option value="uz-cyrl">{t("langUzCyrl")}</option>
                    <option value="ru">{t("langRu")}</option>
                    <option value="en">{t("langEn")}</option>
                  </select>
                </Field>
                <Field label={t("timezone")} htmlFor="s-tz">
                  <select
                    id="s-tz"
                    className="select"
                    value={gen.timezone}
                    onChange={(e) => setGen({ ...gen, timezone: e.target.value })}
                  >
                    <option value="Asia/Tashkent">{t("tzTashkent")}</option>
                    <option value="UTC">{t("tzUtc")}</option>
                  </select>
                </Field>
                <Field label={t("auditCodeFormat")} htmlFor="s-code">
                  <input
                    id="s-code"
                    className="input font-mono"
                    value={gen.auditCodeFormat}
                    onChange={(e) => setGen({ ...gen, auditCodeFormat: e.target.value })}
                  />
                </Field>
                <Field label={t("dateFormat")} htmlFor="s-date">
                  <select
                    id="s-date"
                    className="select"
                    value={gen.dateFormat}
                    onChange={(e) => setGen({ ...gen, dateFormat: e.target.value })}
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  </select>
                </Field>
              </div>
            </Panel>
          )}

          {sec === "roles" && (
            <>
              <div
                className="card card__pad-sm"
                style={{ display: "flex", gap: 12, alignItems: "center" }}
              >
                <Info size={18} style={{ color: "var(--brand)", flexShrink: 0 }} />
                <span className="text-sm" style={{ flex: 1, color: "var(--text-secondary)" }}>
                  {t("rolesBanner")}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={openCreateRole}
                >
                  {t("addRole")}
                </Button>
              </div>

              <Panel title={t("systemRolesTitle")} icon={<ShieldCheck size={15} />} flush>
                {ROLES.map((r) => (
                  <div key={r.code} className="set-row" style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        width: 44,
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 16,
                        color: "var(--brand)",
                      }}
                    >
                      {r.level}
                    </span>
                    <div className="set-row__body">
                      <div className="set-row__title">{r.name}</div>
                      <div className="set-row__desc font-mono">{r.code}</div>
                    </div>
                    <span className="tag tag--ghost">
                      {SYS_PERMS[r.code] === "*"
                        ? t("allPerms")
                        : t("permCount", { n: SYS_PERMS[r.code] })}
                    </span>
                  </div>
                ))}
              </Panel>

              <Panel title={t("customRolesTitle")} icon={<Key size={15} />} flush>
                {roles.length === 0 ? (
                  <p className="text-sm text-muted" style={{ padding: "14px 16px" }}>
                    {t("noCustomRoles")}
                  </p>
                ) : (
                  roles.map((r) => (
                    <div key={r.code} className="set-row" style={{ padding: "12px 16px" }}>
                      <div className="set-row__body">
                        <div
                          className="set-row__title"
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          {r.name}
                          <span className={`tag ${r.tone}`}>{r.code}</span>
                        </div>
                        <div className="set-row__desc">
                          {t("baseLabel", { base: r.baseRole, perms: r.permissions.length })}
                        </div>
                      </div>
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <button
                          type="button"
                          className="iconbtn"
                          aria-label={t("editRole")}
                          onClick={() => openEditRole(r)}
                          disabled={pending}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="iconbtn"
                          aria-label={t("roleDeleted")}
                          onClick={() => removeRole(r.code)}
                          disabled={pending}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </Panel>
            </>
          )}

          {sec === "kpi" && (
            <Panel
              title={t("kpiTitle")}
              icon={<Trophy size={15} />}
              flush
              footer={
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setKpi(kpiRules)}
                    disabled={pending}
                  >
                    {t("reset")}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Save size={14} />}
                    onClick={persistKpi}
                    disabled={pending}
                  >
                    {t("saveRules")}
                  </Button>
                </>
              }
            >
              <div
                className="set-kpi"
                style={{
                  background: "var(--bg-surface-2)",
                  textTransform: "uppercase",
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                }}
              >
                <span style={{ flex: 1 }}>{t("kpiEvent")}</span>
                <span className="set-kpi__pts">{t("kpiPoints")}</span>
                <span style={{ width: 88, textAlign: "right" }}>{t("kpiStatus")}</span>
              </div>
              {kpi.map((r, i) => (
                <div key={r.code} className="set-kpi">
                  <span style={{ flex: 1, fontSize: 13.5, color: "var(--text-primary)" }}>
                    {r.label}
                  </span>
                  <span className="set-kpi__pts">
                    <input
                      type="number"
                      className="set-kpi__input"
                      aria-label={r.label}
                      value={r.points}
                      onChange={(e) => {
                        const points = parseInt(e.target.value, 10) || 0;
                        setKpi((prev) => prev.map((x, j) => (j === i ? { ...x, points } : x)));
                      }}
                      style={{
                        color:
                          r.points > 0
                            ? "var(--status-success-fg)"
                            : r.points < 0
                              ? "var(--status-danger-fg)"
                              : "var(--text-tertiary)",
                      }}
                    />
                  </span>
                  <span className="set-kpi__pts" style={{ width: 88, textAlign: "right" }}>
                    <span className={`tag ${r.points >= 0 ? "tag--success" : "tag--danger"}`}>
                      {r.points >= 0 ? t("reward") : t("penalty")}
                    </span>
                  </span>
                </div>
              ))}
            </Panel>
          )}

          {sec === "ai" && (
            <>
              <Panel
                title={t("aiProviderTitle")}
                icon={<Sparkles size={15} />}
                flush
                footer={
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Activity size={14} />}
                      onClick={runTest}
                      disabled={pending}
                    >
                      {t("testConn")}
                    </Button>
                    {saveFoot(() => persist("ai", ai))}
                  </>
                }
              >
                <div className="form-grid" style={{ padding: 16 }}>
                  <Field label={t("ollamaUrl")} htmlFor="s-url">
                    <input
                      id="s-url"
                      className="input font-mono"
                      value={ai.ollamaUrl}
                      onChange={(e) => setAi({ ...ai, ollamaUrl: e.target.value })}
                    />
                  </Field>
                  <Field label={t("model")} htmlFor="s-model">
                    <select
                      id="s-model"
                      className="select"
                      value={ai.model}
                      onChange={(e) => setAi({ ...ai, model: e.target.value })}
                    >
                      <option value="qwen2.5:14b-instruct">qwen2.5:14b-instruct</option>
                      <option value="llama3.1:8b">llama3.1:8b</option>
                      <option value="mistral-nemo:12b">mistral-nemo:12b</option>
                    </select>
                  </Field>
                  <Field label={t("maxTokens")} htmlFor="s-tok">
                    <input
                      id="s-tok"
                      type="number"
                      className="input"
                      value={ai.maxTokens}
                      onChange={(e) => setAi({ ...ai, maxTokens: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={t("temperature")} htmlFor="s-temp">
                    <input
                      id="s-temp"
                      type="number"
                      step={0.1}
                      className="input"
                      value={ai.temperature}
                      onChange={(e) => setAi({ ...ai, temperature: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </Panel>

              <Panel title={t("aiBehaviorTitle")} icon={<Brain size={15} />} flush>
                <SettingRow
                  title={t("aiEnabledT")}
                  desc={t("aiEnabledD")}
                  on={ai.aiEnabled}
                  onToggle={() => setAi({ ...ai, aiEnabled: !ai.aiEnabled })}
                />
                <SettingRow
                  title={t("aiClosedT")}
                  desc={t("aiClosedD")}
                  on={ai.aiClosed}
                  onToggle={() => setAi({ ...ai, aiClosed: !ai.aiClosed })}
                />
                <SettingRow
                  title={t("aiHistoryT")}
                  desc={t("aiHistoryD")}
                  on={ai.aiHistory}
                  onToggle={() => setAi({ ...ai, aiHistory: !ai.aiHistory })}
                />
              </Panel>
            </>
          )}

          {sec === "notif" && (
            <>
              <Panel title={t("bellTitle")} icon={<Bell size={15} />} flush>
                <SettingRow
                  title={t("nCriticalT")}
                  desc={t("nCriticalD")}
                  on={notif.nCritical}
                  onToggle={() => setNotif({ ...notif, nCritical: !notif.nCritical })}
                />
                <SettingRow
                  title={t("nReturnT")}
                  desc={t("nReturnD")}
                  on={notif.nReturn}
                  onToggle={() => setNotif({ ...notif, nReturn: !notif.nReturn })}
                />
                <SettingRow
                  title={t("nAssignT")}
                  desc={t("nAssignD")}
                  on={notif.nAssign}
                  onToggle={() => setNotif({ ...notif, nAssign: !notif.nAssign })}
                />
                <SettingRow
                  title={t("nReportT")}
                  desc={t("nReportD")}
                  on={notif.nReport}
                  onToggle={() => setNotif({ ...notif, nReport: !notif.nReport })}
                />
                <SettingRow
                  title={t("nSyncT")}
                  desc={t("nSyncD")}
                  on={notif.nSync}
                  onToggle={() => setNotif({ ...notif, nSync: !notif.nSync })}
                />
              </Panel>

              <Panel
                title={t("smtpTitle")}
                icon={<Mail size={15} />}
                flush
                footer={saveFoot(() => persist("notif", notif))}
              >
                <div className="form-grid" style={{ padding: 16 }}>
                  <Field label={t("smtpHost")} htmlFor="s-smtp">
                    <input
                      id="s-smtp"
                      className="input font-mono"
                      value={notif.smtpHost}
                      onChange={(e) => setNotif({ ...notif, smtpHost: e.target.value })}
                    />
                  </Field>
                  <Field label={t("port")} htmlFor="s-port">
                    <input
                      id="s-port"
                      type="number"
                      className="input"
                      value={notif.smtpPort}
                      onChange={(e) => setNotif({ ...notif, smtpPort: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={t("smtpFrom")} htmlFor="s-from">
                    <input
                      id="s-from"
                      className="input font-mono"
                      value={notif.smtpFrom}
                      onChange={(e) => setNotif({ ...notif, smtpFrom: e.target.value })}
                    />
                  </Field>
                  <Field label={t("encryption")} htmlFor="s-enc">
                    <select
                      id="s-enc"
                      className="select"
                      value={notif.smtpEncryption}
                      onChange={(e) => setNotif({ ...notif, smtpEncryption: e.target.value })}
                    >
                      <option value="STARTTLS">{t("starttls")}</option>
                      <option value="SSL/TLS">{t("ssltls")}</option>
                    </select>
                  </Field>
                </div>
              </Panel>
            </>
          )}

          {sec === "security" && (
            <>
              <Panel title={t("authTitle")} icon={<Fingerprint size={15} />} flush>
                <SettingRow
                  title={t("twoFAT")}
                  desc={t("twoFAD")}
                  on={secu.twoFA}
                  onToggle={() => setSecu({ ...secu, twoFA: !secu.twoFA })}
                />
                <SettingRow
                  title={t("lockoutT")}
                  desc={t("lockoutD")}
                  on={secu.lockout}
                  onToggle={() => setSecu({ ...secu, lockout: !secu.lockout })}
                />
                <SettingRow
                  title={t("ipAlertT")}
                  desc={t("ipAlertD")}
                  on={secu.ipAlert}
                  onToggle={() => setSecu({ ...secu, ipAlert: !secu.ipAlert })}
                />
                <SettingRow
                  title={t("rlsT")}
                  desc={t("rlsD")}
                  on={secu.rls}
                  onToggle={() => setSecu({ ...secu, rls: !secu.rls })}
                />
              </Panel>

              <Panel title={t("pwTitle")} icon={<Lock size={15} />} flush>
                <div className="form-grid" style={{ padding: 16 }}>
                  <Field label={t("pwMinLength")} htmlFor="s-pwlen">
                    <input
                      id="s-pwlen"
                      type="number"
                      className="input"
                      value={secu.pwMinLength}
                      onChange={(e) => setSecu({ ...secu, pwMinLength: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={t("hashAlgo")} htmlFor="s-hash">
                    <select id="s-hash" className="select" value="argon2" disabled>
                      <option value="argon2">{t("argon2")}</option>
                    </select>
                  </Field>
                  <Field label={t("pwHistory")} htmlFor="s-pwhist">
                    <input
                      id="s-pwhist"
                      type="number"
                      className="input"
                      value={secu.pwHistory}
                      onChange={(e) => setSecu({ ...secu, pwHistory: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={t("pwExpiry")} htmlFor="s-pwexp">
                    <input
                      id="s-pwexp"
                      type="number"
                      className="input"
                      value={secu.pwExpiryDays}
                      onChange={(e) => setSecu({ ...secu, pwExpiryDays: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </Panel>

              <Panel
                title={t("retentionTitle")}
                icon={<History size={15} />}
                flush
                footer={saveFoot(() => persist("security", secu))}
              >
                <div className="form-grid" style={{ padding: 16 }}>
                  <Field label={t("auditLogYears")} htmlFor="s-retlog">
                    <input
                      id="s-retlog"
                      type="number"
                      className="input"
                      value={secu.auditLogYears}
                      onChange={(e) => setSecu({ ...secu, auditLogYears: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={t("notifDays")} htmlFor="s-retnotif">
                    <input
                      id="s-retnotif"
                      type="number"
                      className="input"
                      value={secu.notifDays}
                      onChange={(e) => setSecu({ ...secu, notifDays: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>

      {/* Add custom role */}
      <Modal
        open={addOpen}
        onClose={closeRoleModal}
        title={editingRole ? t("editRoleTitle") : t("addRoleTitle")}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={closeRoleModal} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={submitRole}
              disabled={pending || rName.trim().length < 2 || rCode.trim().length < 2}
            >
              {editingRole ? t("save") : t("create")}
            </Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 14 }}>
          <Field label={t("roleName")} htmlFor="r-name">
            <input
              id="r-name"
              className="input"
              value={rName}
              onChange={(e) => setRName(e.target.value)}
            />
          </Field>
          <Field label={t("roleCode")} htmlFor="r-code">
            <input
              id="r-code"
              className="input font-mono"
              value={rCode}
              onChange={(e) => setRCode(e.target.value.toLowerCase())}
              placeholder="ext_auditor"
              disabled={!!editingRole}
            />
          </Field>
          <Field label={t("roleBase")} htmlFor="r-base">
            <select
              id="r-base"
              className="select"
              value={rBase}
              onChange={(e) => setRBase(e.target.value as RoleCode)}
            >
              {ROLES.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("rolePermissions")}>
            <div style={{ display: "grid", gap: 8, maxHeight: 260, overflow: "auto" }}>
              {PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className="set-row"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rPerms.includes(permission)}
                    onChange={() => toggleRolePermission(permission)}
                  />
                  <span className="font-mono text-sm">{permission}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
