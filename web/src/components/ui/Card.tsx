import type { ReactNode } from "react";

export type CardPad = "none" | "sm" | "md";

/** Generic card surface over the `.card` classes. */
export function Card({
  soft = false,
  hover = false,
  pad = "md",
  className,
  children,
}: {
  soft?: boolean;
  hover?: boolean;
  pad?: CardPad;
  className?: string;
  children?: ReactNode;
}) {
  const classes = ["card", soft ? "card--soft" : "", hover ? "card--hover" : "", className]
    .filter(Boolean)
    .join(" ");
  const padClass = pad === "sm" ? "card__pad-sm" : pad === "md" ? "card__pad" : "";
  return (
    <div className={classes}>
      {padClass ? <div className={padClass}>{children}</div> : children}
    </div>
  );
}
