import { useTranslations } from "next-intl";
import { Brain, KeyRound, ShieldCheck, Trophy } from "lucide-react";
import { LoginForm } from "./LoginForm";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  animationDelay: `${(i * 0.6).toFixed(1)}s`,
  animationDuration: `${7 + (i % 5)}s`,
}));

export function LoginScreen() {
  const t = useTranslations("auth");
  const features = [
    { Icon: KeyRound, title: t("feat1Title"), text: t("feat1Text") },
    { Icon: Brain, title: t("feat2Title"), text: t("feat2Text") },
    { Icon: Trophy, title: t("feat3Title"), text: t("feat3Text") },
  ];

  return (
    <div className="login">
      <div className="login__side">
        <div className="login__bg" aria-hidden="true">
          <div className="login__grid" />
          <div className="login__sweep" />
          <div className="login__blob login__blob--1" />
          <div className="login__blob login__blob--2" />
          <div className="login__blob login__blob--3" />
          <div className="login__scan" />
          <div className="login__particles">
            {PARTICLES.map((p, i) => (
              <i key={i} className="login__pt" style={p} />
            ))}
          </div>
        </div>

        <div className="login__brandrow" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="login__mark-wrap">
            <span className="login__radar" />
            <span className="login__radar login__radar--2" />
            <div className="brand-mark login__mark" style={{ width: 40, height: 40 }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="brand-text-wrap">
            <span className="brand-title" style={{ fontSize: 16 }}>
              Auditor
            </span>
            <span className="brand-sub">{t("brandSub")}</span>
          </div>
        </div>

        <div className="login__hero">
          <div className="login__chip">
            <span className="dot" />
            <span>{t("chip")}</span>
          </div>
          <h1 style={{ marginTop: 20 }}>{t("heroTitle")}</h1>
          <p>{t("heroText")}</p>
          <div className="login__feats">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="login__feat">
                <div className="login__feat-icon">
                  <Icon size={16} />
                </div>
                <div className="login__feat-text">
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", display: "flex", gap: 16 }}>
          <span>{t("version")}</span>
          <span>{t("copyright")}</span>
        </div>
      </div>

      <div className="login__main">
        <LoginForm />
      </div>
    </div>
  );
}
