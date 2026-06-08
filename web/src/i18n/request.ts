import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * next-intl request configuration (no i18n routing mode).
 *
 * The active locale is resolved from the `NEXT_LOCALE` cookie and falls back to
 * the default (Uzbek). URLs stay clean (no /uz prefix). When ru/en are turned
 * on (see TZ — uz/ru/en), we can either keep cookie-based switching or migrate
 * to locale-prefixed routing without touching component-level translations.
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
