import type { ReactNode } from "react";

/** Bordered surface with optional header/footer over the `.panel` classes. */
export function Panel({
  title,
  icon,
  actions,
  footer,
  flush = false,
  className,
  children,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={["panel", className].filter(Boolean).join(" ")}>
      {title || actions ? (
        <div className="panel__h">
          {title ? (
            <div className="panel__t">
              {icon}
              {title}
            </div>
          ) : (
            <span />
          )}
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      <div className={flush ? "panel__body panel__body--flush" : "panel__body"}>{children}</div>
      {footer ? <div className="panel__foot">{footer}</div> : null}
    </section>
  );
}
