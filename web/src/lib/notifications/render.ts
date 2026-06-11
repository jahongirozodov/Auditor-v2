import type { NotificationType, NotifParams } from "./types";

/** The i18n message key for a notification's title within the "notifications" namespace. */
export function notifTitleKey(type: NotificationType): string {
  return `types.${type}`;
}

/** Coerces stored JSON params into the record next-intl expects. */
export function notifValues(params: unknown): NotifParams {
  return (params && typeof params === "object" ? params : {}) as NotifParams;
}
