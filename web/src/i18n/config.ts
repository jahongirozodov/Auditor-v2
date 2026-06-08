/**
 * Locale configuration. Uzbek (Latin) is the default and only active locale for
 * now; ru/en are reserved per the TZ and can be enabled by adding message
 * catalogs under /messages and listing them here.
 */
export const locales = ["uz"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
