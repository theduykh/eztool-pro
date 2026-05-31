import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { locales, defaultLocale } from "@/i18n/routing";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { localizedHref } from "@/lib/seo/alternates";

export const dynamic = "force-static";

/**
 * One sitemap entry per (path × locale), each carrying reciprocal `hreflang`
 * alternates so search engines can connect the language variants.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const paths = ["/", ...TOOLS_DIRECTORY.map((t) => t.path)];

    return paths.flatMap((path) => {
        const langMap: Record<string, string> = {};
        for (const l of locales) {
            langMap[l] = `${SITE_URL}${localizedHref(l, path)}`;
        }
        langMap["x-default"] = `${SITE_URL}${localizedHref(defaultLocale, path)}`;

        return locales.map((locale) => ({
            url: `${SITE_URL}${localizedHref(locale, path)}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: path === "/" ? 1 : 0.8,
            alternates: { languages: langMap },
        }));
    });
}
