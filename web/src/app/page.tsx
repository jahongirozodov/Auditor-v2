import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const t = useTranslations("home");
  const tApp = useTranslations("app");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--space-8, 32px)",
        background: "var(--bg-page)",
      }}
    >
      <section className="panel" style={{ maxWidth: 640, width: "100%" }}>
        <div className="panel__h">
          <div>
            <div
              className="tag tag--brand"
              style={{ fontFamily: "var(--font-mono)", marginBottom: 8 }}
            >
              {tApp("name")}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {t("title")}
            </h1>
          </div>
        </div>
        <div className="panel__body">
          <p style={{ color: "var(--text-secondary)", marginTop: 0 }}>{t("subtitle")}</p>
          <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0 }}>
            <li>
              <span className="tag tag--success">✓</span> {t("tokensOk")}
            </li>
            <li>
              <span className="tag tag--success">✓</span> {t("fontsOk")}
            </li>
            <li>
              <span className="tag tag--success">✓</span> {t("i18nOk")}
            </li>
          </ul>
        </div>
        <div className="panel__foot">
          <ThemeToggle label={t("themeToggle")} />
        </div>
      </section>
    </main>
  );
}
