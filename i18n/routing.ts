import { defineRouting } from "next-intl/routing";

/**
 * Supported locales. `en` is the default (best SEO reach); `defaultLocale`
 * is the single place to change the fallback language.
 *
 * `localePrefix: "always"` means every locale is prefixed in the URL
 * (`/en/...`, `/vi/...`, ...). This is required for a clean static export
 * where there is no request-time middleware to negotiate the locale.
 */
export const locales = ["en", "vi", "zh", "ko", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Native display names, used by the language switcher. */
export const localeNames: Record<Locale, string> = {
    en: "English",
    vi: "Tiếng Việt",
    zh: "中文",
    ko: "한국어",
    ja: "日本語",
};

export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: "always",
});
