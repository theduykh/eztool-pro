"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { locales, localeNames } from "@/i18n/routing";
import { localizedHref } from "@/lib/seo/alternates";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/**
 * Header language picker. Navigates to the same tool under the chosen locale.
 *
 * This uses a full navigation (not next-intl's soft router) on purpose: the
 * `<html lang>` and the next-themes anti-flash `<script>` live in the
 * `[locale]` layout, so a soft client transition would re-render that script
 * on the client and trigger React's "script tag while rendering" warning. A
 * full navigation re-renders the layout on the server instead — and a reload
 * on language change is expected behavior anyway.
 */
export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations("common");

    function handleChange(next: string) {
        if (next === locale) return;
        const target =
            localizedHref(next, pathname) +
            window.location.search +
            window.location.hash;
        window.location.assign(target);
    }

    return (
        <Select value={locale} onValueChange={handleChange}>
            <SelectTrigger
                id="select-language"
                aria-label={t("selectLanguage")}
                className="gap-1.5 border-0 bg-transparent px-2 text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-transparent"
            >
                <Globe className="size-4" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
                {locales.map((l) => (
                    <SelectItem key={l} id={`opt-lang-${l}`} value={l}>
                        {localeNames[l]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
