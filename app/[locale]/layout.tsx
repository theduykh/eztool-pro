import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppShell } from "@/components/shared/AppShell";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/config/site";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin", "latin-ext", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin", "latin-ext", "vietnamese"],
});

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: t("titleDefault"),
            template: t("titleTemplate"),
        },
        description: t("description"),
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Enable static rendering for this locale.
    setRequestLocale(locale);

    return (
        <html
            lang={locale}
            className={`${inter.variable} ${jetbrainsMono.variable}`}
            suppressHydrationWarning
        >
            <body>
                <NextIntlClientProvider>
                    <ThemeProvider>
                        <AppShell>{children}</AppShell>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
