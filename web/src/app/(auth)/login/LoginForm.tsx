"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, LogIn, Shield, ShieldAlert, User } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const t = useTranslations("auth");
  const [showPass, setShowPass] = useState(false);
  const [state, formAction, pending] = useActionState<LoginState | undefined, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form className="login__form login__form--anim" action={formAction}>
      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>{t("formTitle")}</h2>
        <p className="text-sm text-muted">{t("formSub")}</p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="email">
          {t("loginLabel")}
        </label>
        <div className="input-group">
          <User className="icon-l" />
          <input
            id="email"
            name="email"
            className="input"
            type="email"
            autoComplete="username"
            placeholder={t("loginPlaceholder")}
            defaultValue="a.yoldoshev@gov.uz"
            required
          />
        </div>
      </div>

      <div className="field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="field__label" htmlFor="password">
            {t("passwordLabel")}
          </label>
          <a href="#" style={{ fontSize: 12, fontWeight: 600 }}>
            {t("forgot")}
          </a>
        </div>
        <div className="input-group">
          <Lock className="icon-l" />
          <input
            id="password"
            name="password"
            className="input"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            style={{ paddingRight: 36 }}
            required
          />
          <button
            type="button"
            className="iconbtn"
            aria-label={t("showPassword")}
            style={{ position: "absolute", right: 2, top: 1, width: 32, height: 32 }}
            onClick={() => setShowPass((v) => !v)}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="field__hint" style={{ color: "var(--status-danger-fg)" }}>
          {t("error")}
        </p>
      ) : null}

      <label
        className="field__label"
        style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 13 }}
      >
        <input type="checkbox" name="remember" className="checkbox" defaultChecked />
        <span>{t("remember")}</span>
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--lg"
        style={{ width: "100%" }}
        disabled={pending}
      >
        <LogIn size={16} />
        <span>{pending ? t("submitting") : t("submit")}</span>
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
        <span>{t("or")}</span>
        <span style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
      </div>

      {/* SEAM: AD / domain-certificate login (LDAP) — wired in Phase 1/3. */}
      <button
        type="button"
        className="btn btn--secondary btn--lg"
        style={{ width: "100%" }}
        disabled
        title={t("adButton")}
      >
        <Shield size={16} />
        <span>{t("adButton")}</span>
      </button>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--text-tertiary)",
          display: "flex",
          gap: 10,
        }}
      >
        <ShieldAlert size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
        <span>{t("demoNote")}</span>
      </div>
    </form>
  );
}
