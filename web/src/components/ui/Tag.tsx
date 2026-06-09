import type { ReactNode } from "react";

export type TagTone =
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "outline"
  | "ghost";

const TONE_CLASS: Record<TagTone, string> = {
  neutral: "",
  brand: "tag--brand",
  info: "tag--info",
  success: "tag--success",
  warning: "tag--warning",
  danger: "tag--danger",
  outline: "tag--outline",
  ghost: "tag--ghost",
};

/** Status/label pill over the `.tag` classes. */
export function Tag({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: TagTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const classes = ["tag", TONE_CLASS[tone], className].filter(Boolean).join(" ");
  return (
    <span className={classes}>
      {icon}
      {children}
    </span>
  );
}
