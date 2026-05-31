import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";

/**
 * Normalize an unprefixed in-app path to a leading-slash, no-trailing-slash
 * form. The home path (`""` or `"/"`) normalizes to `""` so it can be
 * appended directly after the locale segment.
 */
function normalizePath(path: string): string {
    if (!path || path === "/") return "";
    const withLeading = path.startsWith("/") ? path : `/${path}`;
    return withLeading.endsWith("/") ? withLeading.slice(0, -1) : withLeading;
}

/**
 * Prefix an unprefixed in-app path with a locale segment, producing a
 * root-relative URL (e.g. `localizedHref("vi", "/dev/json-formatter")`
 * → `/vi/dev/json-formatter`, `localizedHref("en", "/")` → `/en`).
 */
export function localizedHref(locale: string, path: string): string {
    return `/${locale}${normalizePath(path)}`;
}

/**
 * Build the `alternates` block for a page's metadata: a self-canonical for the
 * current locale plus reciprocal `hreflang` links for every locale and an
 * `x-default` pointing at the default locale. URLs are root-relative and are
 * resolved against `metadataBase` (set in the locale layout) into absolute
 * URLs by Next.js.
 *
 * @param locale  the current locale
 * @param path    the unprefixed in-app path (e.g. "/dev/json-formatter" or "/")
 */
export function buildAlternates(
    locale: string,
    path: string,
): NonNullable<Metadata["alternates"]> {
    const languages: Record<string, string> = {};
    for (const l of locales) {
        languages[l] = localizedHref(l, path);
    }
    languages["x-default"] = localizedHref(defaultLocale, path);

    return {
        canonical: localizedHref(locale, path),
        languages,
    };
}

export type { Locale };
