import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon (e.g. a lucide-react glyph). */
  icon?: ReactNode;
  /** Trailing icon. */
  iconRight?: ReactNode;
  /** Square icon-only button. */
  iconOnly?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  soft: "btn--soft",
  danger: "btn--danger",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  xs: "btn--xs",
  sm: "btn--sm",
  md: "",
  lg: "btn--lg",
};

/**
 * Typed wrapper over the design-system `.btn` classes (src/styles/app.css).
 * Styling comes entirely from tokens/classes — no inline visual values.
 */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  iconOnly = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    iconOnly ? "btn--icon" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
